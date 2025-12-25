import fastapi
from typing import Optional, List

from .utils.user import get_user, get_users, create_user, get_user_by_email
from .utils.course import get_user_courses
from db.db_setup import get_db

from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic_schemas.user import UserCreate, User
from pydantic_schemas.course import Course

router = fastapi.APIRouter()

@router.get("/users", response_model=List[User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.post("/users")
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise fastapi.HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@router.get("/user/{id}")
async def read_user(id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, id)
    if db_user is None:
        raise fastapi.HTTPException(status_code=404, detail="User not found")
    return db_user
  
@router.get("/user/{id}/courses", response_model=List[Course])
async def read_user_courses(id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, id)
    if db_user is None:
        raise fastapi.HTTPException(status_code=404, detail="User not found")
    return get_user_courses(db, user_id=id)