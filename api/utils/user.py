from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models.user import User
from pydantic_schemas.user import UserCreate
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

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
    hashed = hash_password(user.password)
    db_user = User(email=user.email, role=user.role, password=hashed)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

