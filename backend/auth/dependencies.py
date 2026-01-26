from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import Optional

from auth.config import SECRET_KEY, ALGORITHM
from auth.schemas import TokenData
from auth.utils import decode_token
from db.db_setup import get_async_db
from api.utils.user import get_user_by_email
from db.models.user import Role, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)):
    try:
        payload = decode_token(token)
        email: str | None = payload.get("sub")
        if email is None:
            raise JWTError()
        token_data = TokenData(email=email)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    result = await db.execute(
        select(User).where(User.email == token_data.email)
        .options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)):
    """Optional dependency - returns user if token is valid, None if no token provided"""
    if not token:
        return None
    try:
        payload = decode_token(token)
        email: str | None = payload.get("sub")
        if email is None:
            raise JWTError()
        token_data = TokenData(email=email)
    except JWTError:
        return None
    user = await get_user_by_email(db, token_data.email)
    return user


async def get_teacher_user(current_user = Depends(get_current_user)):
    """Dependency to ensure user is a teacher"""
    if current_user.role != Role.teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can perform this action")
    return current_user


async def get_student_user(current_user = Depends(get_current_user)):
    """Dependency to ensure user is a student"""
    if current_user.role != Role.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can perform this action")
    return current_user
