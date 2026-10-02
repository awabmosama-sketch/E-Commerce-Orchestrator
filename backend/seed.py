import asyncio
from sqlmodel import SQLModel, select
from app.database import SessionLocal, engine
from app.models import Ticket, User
from app.security import hash_pw

DEMO = [
    ("ali@example.com", "ORD-10432", "Order failed but money deducted", "Paid via card, got a timeout, no order confirmation."),
    ("sara@example.com", "ORD-10455", "Refund not received", "Cancelled 6 days ago, refund still not in my account."),
    ("john@example.com", "ORD-10461", "Checkout loops forever", "Clicking Pay just spins and returns to checkout."),
]

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with SessionLocal() as db:
        if not (await db.exec(select(User).where(User.email == "admin@shop.io"))).first():
            db.add(User(email="admin@shop.io", name="Support Admin", role="L2", password_hash=hash_pw("admin123")))

        existing = (await db.exec(select(Ticket))).all()
        if existing:
            print(f"Tickets already exist ({len(existing)}). Skipping ticket seed.")
        else:
            for email, ref, subject, body in DEMO:
                db.add(Ticket(customer_email=email, order_ref=ref, subject=subject, body=body))

        await db.commit()
    print("Done. Login: admin@shop.io / admin123")

asyncio.run(main())