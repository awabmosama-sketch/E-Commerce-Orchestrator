import json
from functools import lru_cache
from typing import Literal
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from sqlalchemy import text
from ..config import settings
from ..database import engine
from .state import State

_ai_status = {
    "connected": bool(settings.google_api_key),
    "message": "Gemini is configured" if settings.google_api_key else "GOOGLE_API_KEY is missing",
}

def ai_status() -> dict:
    return dict(_ai_status)

def mark_ai_failure(exc: Exception) -> None:
    _ai_status.update(connected=False, message=str(exc))

@lru_cache(maxsize=1)
def get_llm() -> ChatGoogleGenerativeAI:
    if not settings.google_api_key:
        mark_ai_failure(RuntimeError("GOOGLE_API_KEY is required to run an AI investigation"))
        raise RuntimeError("GOOGLE_API_KEY is required to run an AI investigation")
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=0,
    )

ENDPOINTS = {"refund": "/api/refund", "retry_payment": "/api/payments/retry"}

def content_to_text(content: object) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("text"):
                parts.append(str(block["text"]))
        if parts:
            return "\n".join(parts)
    if isinstance(content, dict) and content.get("text"):
        return str(content["text"])
    return str(content)

class RouteOut(BaseModel):
    agents: list[Literal["db_analyst", "log_analyst"]] = Field(
        description="Analysts needed. Payment/money issues → db_analyst. Timeouts/5xx → log_analyst."
    )

class PlanOut(BaseModel):
    root_cause: str = Field(description="One-sentence root cause grounded in the evidence.")
    confidence: float = Field(ge=0, le=1)
    steps: list[str] = Field(description="Ordered remediation steps for the engineer to read.")
    action: Literal["refund", "retry_payment", "escalate", "none"]
    action_payload: dict = Field(default_factory=dict)
    customer_reply: str = Field(description="Plain-language reply to send the customer.")

PLANNER_PROMPT = """You are the supervisor of an e-commerce support swarm.
Given a ticket plus DB and log evidence, produce a root cause and the minimal remediation plan.

Rules:
- Never invent endpoints; pick exactly one allowed action.
- action_payload for refund: {"order_id": int, "amount": number, "reason": str}
- action_payload for retry_payment: {"payment_id": int}
- If evidence is insufficient or money already settled, use action="escalate" and confidence < 0.5.
"""

async def supervisor(state: State) -> dict:
    decision = await get_llm().with_structured_output(RouteOut).ainvoke(
        [
            {"role": "system", "content": "Route this support ticket to the analysts required."},
            {"role": "user", "content": json.dumps(state["ticket"])},
        ]
    )
    return {"route": decision.agents}

async def db_analyst(state: State) -> dict:
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    """
                    SELECT o.id AS order_id, o.status AS order_status, o.amount,
                           p.id AS payment_id, p.status AS payment_status,
                           p.gateway_ref, p.created_at
                    FROM orders o
                    LEFT JOIN payments p ON p.order_id = o.id
                    WHERE o.customer_email = :email OR o.ref = :ref
                    ORDER BY o.created_at DESC
                    LIMIT 5
                    """
                ),
                {"email": state["ticket"]["customer_email"], "ref": state["ticket"].get("order_ref", "")},
            )
        ).mappings().all()

    evidence = json.dumps([dict(r) for r in rows], default=str)
    summary = await get_llm().ainvoke(
        [
            {"role": "system", "content": "Summarise the DB evidence in 3 terse bullets. Quote exact IDs and statuses."},
            {"role": "user", "content": evidence},
        ]
    )
    return {"db": content_to_text(summary.content)}

async def log_analyst(state: State) -> dict:
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    """
                    SELECT endpoint, status_code, latency_ms, error, created_at
                    FROM api_logs
                    WHERE customer_email = :email
                    ORDER BY created_at DESC LIMIT 25
                    """
                ),
                {"email": state["ticket"]["customer_email"]},
            )
        ).mappings().all()

    summary = await get_llm().ainvoke(
        [
            {"role": "system", "content": "Summarise API log anomalies in 3 terse bullets. Flag error spikes."},
            {"role": "user", "content": json.dumps([dict(r) for r in rows], default=str)},
        ]
    )
    return {"logs": content_to_text(summary.content)}

async def planner(state: State) -> dict:
    plan: PlanOut = await get_llm().with_structured_output(PlanOut).ainvoke(
        [
            {"role": "system", "content": PLANNER_PROMPT},
            {
                "role": "user",
                "content": json.dumps(
                    {"ticket": state["ticket"], "db_evidence": state.get("db"), "log_evidence": state.get("logs")}
                ),
            },
        ]
    )
    return {"plan": plan.model_dump()}

async def action(state: State) -> dict:
    plan = state["plan"]
    endpoint = ENDPOINTS.get(plan["action"])
    if not endpoint:
        return {"result": {"status": "noop", "action": plan["action"]}}

    async with httpx.AsyncClient(base_url=settings.ecommerce_api, timeout=20) as client:
        resp = await client.post(endpoint, json=plan["action_payload"])

    return {"result": {"status": resp.status_code, "endpoint": endpoint, "body": resp.text[:800]}}