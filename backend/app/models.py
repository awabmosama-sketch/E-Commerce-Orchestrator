from datetime import datetime, timezone
from typing import Any, Optional
from sqlmodel import JSON, Column, Field, SQLModel

def now() -> datetime:
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str = ""
    role: str = "L1"
    password_hash: str

class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_email: str = Field(index=True)
    order_ref: str = ""
    subject: str
    body: str = ""
    status: str = Field(default="open", index=True)
    thread_id: str = Field(default="", index=True)
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)

class Investigation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: int = Field(index=True, foreign_key="ticket.id")
    root_cause: str = ""
    confidence: float = 0.0
    plan: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    findings: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    result: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    approved_by: Optional[int] = None
    created_at: datetime = Field(default_factory=now)