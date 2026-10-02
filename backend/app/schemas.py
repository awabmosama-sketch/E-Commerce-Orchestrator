from datetime import datetime
from sqlmodel import SQLModel

class LoginIn(SQLModel):
    email: str
    password: str

class UserRead(SQLModel):
    id: int
    email: str
    name: str
    role: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

class TicketCreate(SQLModel):
    customer_email: str
    order_ref: str = ""
    subject: str
    body: str = ""

class TicketRead(SQLModel):
    id: int
    customer_email: str
    order_ref: str
    subject: str
    body: str
    status: str
    thread_id: str
    created_at: datetime
    updated_at: datetime

class InvestigationRead(SQLModel):
    id: int
    ticket_id: int
    root_cause: str
    confidence: float
    plan: dict
    findings: dict
    result: dict
    approved_by: int | None
    created_at: datetime

class TicketDetail(TicketRead):
    investigation: InvestigationRead | None = None