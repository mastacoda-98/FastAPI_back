from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import fastapi
from auth.utils import verify_password, create_access_token
from db.db_setup import get_async_db
from api.utils.user import get_user_by_email
from auth.schemas import Token
from auth.dependencies import get_current_user

router = fastapi.APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def read_me(current_user = Depends(get_current_user)):
    return current_user
