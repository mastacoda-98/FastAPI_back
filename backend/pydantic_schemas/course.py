from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class EnrollmentStatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    direct = "direct"


class CoursesBase(BaseModel):
    title: str
    description: Optional[str] = None


class CourseCreate(CoursesBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class CourseResponse(CoursesBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class StudentEnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatusEnum
    completed: bool
    approved_at: Optional[datetime]
    created_at: datetime

    class Config:
        orm_mode = True


class EnrollmentApprovalRequest(BaseModel):
    approved: bool
    rejected_reason: Optional[str] = None


class StudentCourseInfoResponse(BaseModel):
    """For student dashboard"""
    id: int
    title: str
    description: Optional[str]
    status: EnrollmentStatusEnum
    completed: bool
    completion_percentage: int
    creator_email: str
    teacher_name: Optional[str] = None
    teacher_email: Optional[str] = None

    class Config:
        orm_mode = True


class ContentResponse(BaseModel):
    """Content within a section"""
    id: int
    title: str
    description: Optional[str]
    url: Optional[str]
    content_type_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class SectionResponse(BaseModel):
    """Section with nested contents"""
    id: int
    title: str
    contents: List[ContentResponse] = []

    class Config:
        orm_mode = True


class AssignmentResponse(BaseModel):
    """Assignment in a course"""
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    max_score: int
    created_at: datetime

    class Config:
        orm_mode = True


class SubmissionResponse(BaseModel):
    """Student submission to assignment"""
    id: int
    assignment_id: int
    file_url: Optional[str]
    score: Optional[int]
    feedback: Optional[str]
    created_at: datetime
    updated_at: datetime
    student_id: int

    class Config:
        orm_mode = True


class CourseDetailResponse(CourseResponse):
    """Full course details with sections, assignments, and enrollment info"""
    sections: List[SectionResponse] = []
    assignments: List[AssignmentResponse] = []
    is_enrolled: bool = False
    enrollment_status: Optional[EnrollmentStatusEnum] = None

    class Config:
        orm_mode = True