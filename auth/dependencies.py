from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from auth.config import SECRET_KEY, ALGORITHM
from auth.schemas import TokenData
from auth.utils import decode_token
from db.db_setup import get_async_db
from api.utils.user import get_user_by_email

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
    user = await get_user_by_email(db, token_data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
