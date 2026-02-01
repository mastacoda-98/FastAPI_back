from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from enum import IntEnum


class UserBase(BaseModel):
    email: EmailStr
    role: str
    
class UserCreate(UserBase):
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    
class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    profile_name: Optional[str]
    bio: Optional[str] = None
    created_at: datetime
    
    courses_created: Optional[List[dict]] = None
    total_students_enrolled: Optional[int] = None
    total_pending_requests: Optional[int] = None
    pending_enrollments: Optional[List[dict]] = None
    
    enrolled_courses: Optional[List[dict]] = None
    total_courses_enrolled: Optional[int] = None
    total_courses_approved: Optional[int] = None
    total_courses_pending: Optional[int] = None
    total_courses_completed: Optional[int] = None
    overall_completion_percentage: Optional[int] = None
    pending_requests: Optional[List[dict]] = None
    
    model_config = ConfigDict(from_attributes=True)
