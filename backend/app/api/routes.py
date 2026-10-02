from uuid import uuid4
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..database import SessionLocal, get_session
from ..models import Investigation, Ticket, User, now
from ..schemas import (
    InvestigationRead, LoginIn, TicketCreate, TicketDetail, TicketRead, Token, UserRead
)
from ..security import check_pw, make_token
from ..agents.nodes import mark_ai_failure
from .deps import current_user

router = APIRouter()

# ---------- Auth ----------
@router.post("/auth/login", response_model=Token)
async def login(body: LoginIn, db: AsyncSession = Depends(get_session)):
    user = (await db.exec(select(User).where(User.email == body.email))).first()
    if not user or not check_pw(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return Token(access_token=make_token(user.id), user=UserRead.model_validate(user))

@router.get("/auth/me", response_model=UserRead)
async def me(user: User = Depends(current_user)):
    return user

# ---------- Tickets ----------
@router.get("/tickets/stats/overview")
async def stats(db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    rows = (await db.exec(select(Ticket.status, func.count()).group_by(Ticket.status))).all()
    total = sum(n for _, n in rows)
    return {"total": total, "by_status": {s: n for s, n in rows}}

@router.get("/tickets", response_model=list[TicketRead])
async def list_tickets(
    status: str | None = None,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    stmt = select(Ticket).order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
    if status:
        stmt = stmt.where(Ticket.status == status)
    if q:
        stmt = stmt.where(Ticket.subject.ilike(f"%{q}%") | Ticket.customer_email.ilike(f"%{q}%"))
    return (await db.exec(stmt)).all()

@router.post("/tickets", response_model=TicketRead, status_code=201)
async def create_ticket(body: TicketCreate, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    ticket = Ticket(**body.model_dump())
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.get("/tickets/{ticket_id}", response_model=TicketDetail)
async def get_ticket(ticket_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    inv = (
        await db.exec(
            select(Investigation).where(Investigation.ticket_id == ticket_id).order_by(Investigation.id.desc())
        )
    ).first()
    return TicketDetail(
        **ticket.model_dump(),
        investigation=InvestigationRead.model_validate(inv) if inv else None,
    )

@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead)
async def set_status(ticket_id: int, status: str, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ticket.status, ticket.updated_at = status, now()
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

# ---------- AI actions ----------
async def _investigate(graph, ticket_id: int, config: dict, payload: dict) -> None:
    async with SessionLocal() as db:
        try:
            await graph.ainvoke({"ticket": payload}, config)
            snapshot = await graph.aget_state(config)
            values = snapshot.values
            plan = values.get("plan", {})
            db.add(
                Investigation(
                    ticket_id=ticket_id,
                    root_cause=plan.get("root_cause", ""),
                    confidence=plan.get("confidence", 0.0),
                    plan=plan,
                    findings={"db": values.get("db", ""), "logs": values.get("logs", "")},
                )
            )
            ticket = await db.get(Ticket, ticket_id)
            ticket.status, ticket.updated_at = "awaiting_approval", now()
        except Exception as exc:
            mark_ai_failure(exc)
            ticket = await db.get(Ticket, ticket_id)
            ticket.status, ticket.updated_at = "failed", now()
            db.add(Investigation(ticket_id=ticket_id, findings={"error": str(exc)}))
        db.add(ticket)
        await db.commit()

async def _resume(graph, ticket_id: int, config: dict, engineer_id: int, action: str) -> None:
    async with SessionLocal() as db:
        inv = (
            await db.exec(
                select(Investigation).where(Investigation.ticket_id == ticket_id).order_by(Investigation.id.desc())
            )
        ).first()
        ticket = await db.get(Ticket, ticket_id)

        if action == "reject":
            snapshot = await graph.aget_state(config)
            plan = dict(snapshot.values.get("plan", {}))
            plan["action"] = "none"
            await graph.aupdate_state(config, {"plan": plan})
        else:
            if inv:
                inv.approved_by = engineer_id

        try:
            final = await graph.ainvoke(None, config)
            if inv:
                inv.result = final.get("result", {})
                db.add(inv)
            ticket.status = "rejected" if action == "reject" else "resolved"
        except Exception as exc:
            ticket.status = "awaiting_approval"
            if inv:
                inv.approved_by = None
                inv.result = {"error": str(exc)}
                db.add(inv)
        ticket.updated_at = now()
        db.add(ticket)
        await db.commit()

@router.post("/tickets/{ticket_id}/investigate", status_code=202)
async def investigate(
    ticket_id: int,
    request: Request,
    bg: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if ticket.status in {"investigating", "awaiting_approval", "executing"}:
        raise HTTPException(409, "Investigation already in progress")

    ticket.thread_id = ticket.thread_id or f"ticket-{ticket_id}-{uuid4().hex[:8]}"
    ticket.status, ticket.updated_at = "investigating", now()
    db.add(ticket)
    await db.commit()

    payload = {"subject": ticket.subject, "body": ticket.body, "order_ref": ticket.order_ref,
               "customer_email": ticket.customer_email, "ticket_id": ticket.id}
    config = {"configurable": {"thread_id": ticket.thread_id}}
    bg.add_task(_investigate, request.app.state.graph, ticket_id, config, payload)
    return {"status": "investigating", "thread_id": ticket.thread_id}

@router.post("/tickets/{ticket_id}/approve", status_code=202)
async def approve(ticket_id: int, request: Request, bg: BackgroundTasks,
                  user: User = Depends(current_user), db: AsyncSession = Depends(get_session)):
    return await _decide("approve", ticket_id, request, bg, user, db)

@router.post("/tickets/{ticket_id}/reject", status_code=202)
async def reject(ticket_id: int, request: Request, bg: BackgroundTasks,
                 user: User = Depends(current_user), db: AsyncSession = Depends(get_session)):
    return await _decide("reject", ticket_id, request, bg, user, db)

async def _decide(action, ticket_id, request, bg, user, db):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if ticket.status != "awaiting_approval":
        raise HTTPException(409, "Ticket is not awaiting approval")

    ticket.status, ticket.updated_at = "executing", now()
    db.add(ticket)
    await db.commit()

    config = {"configurable": {"thread_id": ticket.thread_id}}
    bg.add_task(_resume, request.app.state.graph, ticket_id, config, user.id, action)
    return {"status": action}