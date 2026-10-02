import asyncio
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from . import models  # noqa
from .agents.graph import graph_ctx
from .agents.nodes import ai_status
from .config import settings
from .database import engine
from .api.routes import router

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with graph_ctx() as graph:
        app.state.graph = graph
        yield

app = FastAPI(title="AI Support Orchestrator", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/health/ai")
async def ai_health():
    return ai_status()