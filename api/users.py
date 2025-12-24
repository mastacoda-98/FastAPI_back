import fastapi
from typing import Optional, List

from .utils.user import get_user, get_users, create_user
from db.db_setup import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic_schemas.user import UserCreate, User

router = fastapi.APIRouter()

@router.get("/users", response_model=List[User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.post("/users")
async def create_new_user(user: User):
    return create

# @router.get("/users/{id}")
# async def read_user(id):
#     return {"user": users[id]}
