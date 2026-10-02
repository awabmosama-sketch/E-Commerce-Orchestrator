from fastapi import FastAPI

app = FastAPI(title="Mock Commerce API")

@app.post("/api/refund")
async def refund(payload: dict):
    return {"status": "accepted", "action": "refund", "payload": payload}

@app.post("/api/payments/retry")
async def retry_payment(payload: dict):
    return {"status": "accepted", "action": "retry_payment", "payload": payload}