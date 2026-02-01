from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
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


class TeacherInfo(BaseModel):
    id: int
    email: str
    profile_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class CourseResponse(CoursesBase):
    id: int
    user_id: int
    created_at: datetime
    creator: Optional[TeacherInfo] = None
    enrolled_students_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class StudentEnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatusEnum
    completed: bool
    approved_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnrollmentApprovalRequest(BaseModel):
    approved: bool
    rejected_reason: Optional[str] = None


class StudentCourseInfoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: EnrollmentStatusEnum
    completed: bool
    completion_percentage: int
    creator_email: str
    teacher_name: Optional[str] = None
    teacher_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ContentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    url: Optional[str]
    content_type_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SectionResponse(BaseModel):
    id: int
    title: str
    contents: List[ContentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    max_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    file_url: Optional[str]
    score: Optional[int]
    feedback: Optional[str]
    created_at: datetime
    updated_at: datetime
    student_id: int

    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(CourseResponse):
    sections: List[SectionResponse] = []
    assignments: List[AssignmentResponse] = []
    is_enrolled: bool = False
    enrollment_status: Optional[EnrollmentStatusEnum] = None