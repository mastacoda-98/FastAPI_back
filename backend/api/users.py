import fastapi
from typing import List

from .utils.user import get_user, get_users, create_user, get_user_by_email, get_user_dashboard
from .utils.course import get_user_courses
from db.db_setup import get_async_db
from auth.dependencies import get_current_user

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from pydantic_schemas.user import UserCreate, User, DashboardResponse
from pydantic_schemas.course import CourseResponse

router = fastapi.APIRouter()


@router.get("/users", response_model=List[User])
async def read_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    users = await get_users(db, skip=skip, limit=limit)
    users_with_profile = []
    for user in users:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "profile_name": None
        }
        if user.profile:
            profile_name = f"{user.profile.first_name or ''} {user.profile.last_name or ''}".strip()
            user_dict["profile_name"] = profile_name if profile_name else None
            if user_dict["profile_name"] is not None:
                users_with_profile.append(user_dict)
    return users_with_profile


@router.post("/users", response_model=User)
async def create_new_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    db_user = await get_user_by_email(db, email=user.email)
    if db_user:
        raise fastapi.HTTPException(status_code=400, detail="Email already registered")
    return await create_user(db=db, user=user)


@router.get("/user/{id}", response_model=DashboardResponse)
async def read_user(id: int, db: AsyncSession = Depends(get_async_db)):
    db_user = await get_user(db, id)
    if db_user is None:
        raise fastapi.HTTPException(status_code=404, detail="User not found")
    user_data = await get_user_dashboard(db, db_user)
    return user_data
  

@router.get("/user/{id}/courses", response_model=List[CourseResponse])
async def read_user_courses(id: int, db: AsyncSession = Depends(get_async_db)):
    db_user = await get_user(db, id)
    if db_user is None:
        raise fastapi.HTTPException(status_code=404, detail="User not found")
    return await get_user_courses(db, user_id=id)


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    """Get unified dashboard for current user (teacher or student)"""
    dashboard = await get_user_dashboard(db, current_user)
    return dashboard