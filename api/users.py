from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

router = fastapi.APIRouter()

users = []

class User(BaseModel):
    email: str
    is_active: bool
    bio: Optional[str]

@router.get("/users", response_model=List[User])
async def get_users():
    return users

@router.post("/users")
async def create_user(user: User):
    users.append(user)
    return "Success"

@router.get("/users/{id}")
async def get_user(id):
    return {"user": users[id]}
