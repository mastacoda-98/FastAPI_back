from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost/postgres"
ASYNC_SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/postgres"


# synchronous engine / session (used by Alembic and any sync code)
engine = create_engine(SQLALCHEMY_DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


# async engine / session factory (for the async app runtime)
async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, future=True)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False, future=True)

Base = declarative_base()


# DB Utilities (sync)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Async DB Utilities
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()