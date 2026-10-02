from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from .config import settings

def _asyncpg_dsn(url: str) -> str:
    return url.split("?")[0].replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    _asyncpg_dsn(settings.database_url),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
    pool_recycle=300,
    connect_args={
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with SessionLocal() as session:
        yield session