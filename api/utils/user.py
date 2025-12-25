from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.user import User
from pydantic_schemas.user import UserCreate


async def get_user(db: AsyncSession, user_id: int):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = select(User).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(email=user.email, role=user.role)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
