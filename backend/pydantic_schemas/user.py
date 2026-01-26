from datetime import datetime
from pydantic import BaseModel, EmailStr
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
    
    class Config:
        orm_mode = True


class DashboardResponse(BaseModel):
    """Unified dashboard schema for both teacher and student"""
    id: int
    email: EmailStr
    role: str  # "teacher" or "student"
    profile_name: Optional[str]
    created_at: datetime
    
    # Teacher data
    courses_created: Optional[List[dict]] = None  # [{id, title, description, created_at, total_students, pending_requests}, ...]
    total_students_enrolled: Optional[int] = None
    total_pending_requests: Optional[int] = None
    pending_enrollments: Optional[List[dict]] = None  # [{enrollment_id, student_email, course_title, requested_at}, ...]
    
    # Student data
    enrolled_courses: Optional[List[dict]] = None  # [{course_id, title, description, teacher_name, teacher_email, status, completed, completion_percentage, enrolled_at, total_assignments, completed_assignments}, ...]
    total_courses_enrolled: Optional[int] = None
    total_courses_approved: Optional[int] = None
    total_courses_pending: Optional[int] = None
    total_courses_completed: Optional[int] = None
    overall_completion_percentage: Optional[int] = None
    pending_requests: Optional[List[dict]] = None  # [{course_id, course_title, requested_at, status}, ...]
    
    class Config:
        orm_mode = True