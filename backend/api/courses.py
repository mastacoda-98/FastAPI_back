import fastapi
from typing import List, Optional
from db.db_setup import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status

from pydantic_schemas.course import CourseCreate, CourseResponse, EnrollmentApprovalRequest, CourseDetailResponse
from auth.dependencies import get_teacher_user, get_student_user, get_current_user_optional
from api.utils.course import get_courses, create_course, get_course, get_course_with_details, check_enrollment
from api.utils.user import request_enrollment_util, approve_enrollment_util
from db.models.course import Course, StudentCourse
from db.models.user import User

router = fastapi.APIRouter(prefix="/courses", tags=["courses"])


# =============== TEACHER ENDPOINTS ===============

@router.post("/create", response_model=CourseResponse, tags=["teacher"])
async def create_course_teacher(
    course: CourseCreate,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    db_course = await create_course(db, course, teacher.id)
    return db_course


@router.patch("/enrollment/{enrollment_id}/approve", tags=["teacher"])
async def approve_enrollment(
    enrollment_id: int,
    request: EnrollmentApprovalRequest,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """Teacher approves or rejects a student enrollment request"""
    enrollment, message = await approve_enrollment_util(db, teacher.id, enrollment_id, request.approved, request.rejected_reason)
    return {"message": message, "enrollment": enrollment}


# =============== STUDENT ENDPOINTS ===============

@router.get("", response_model=List[CourseResponse], tags=["public"])
async def read_all_courses(db: AsyncSession = Depends(get_async_db)):
    """View all available courses"""
    courses = await get_courses(db)
    return courses


@router.get("/{id}", response_model=CourseDetailResponse, tags=["public"])
async def read_course(
    id: int, 
    db: AsyncSession = Depends(get_async_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    View course details with sections, contents, and assignments.
    If authenticated, returns enrollment status.
    """
    # Get course with all details (sections, contents, assignments)
    db_course = await get_course_with_details(db, id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check enrollment status if user is authenticated
    is_enrolled = False
    enrollment_status = None
    
    if current_user:
        enrollment = await check_enrollment(db, current_user.id, id)
        if enrollment:
            is_enrolled = True
            enrollment_status = enrollment.status.value
    
    # Calculate creator profile name
    creator = None
    if db_course.creator:
        profile = db_course.creator.profile
        first_name = profile.first_name or "" if profile else ""
        last_name = profile.last_name or "" if profile else ""
        profile_name = f"{first_name} {last_name}".strip() or None
        creator = {
            "id": db_course.creator.id,
            "email": db_course.creator.email,
            "profile_name": profile_name
        }
    
    # Convert to response dict
    response_data = {
        "id": db_course.id,
        "title": db_course.title,
        "description": db_course.description,
        "user_id": db_course.user_id,
        "created_at": db_course.created_at,
        "creator": creator,
        "sections": [
            {
                "id": section.id,
                "title": section.title,
                "contents": [
                    {
                        "id": content.id,
                        "title": content.title,
                        "description": content.description,
                        "url": content.url,
                        "content_type_id": content.content_type_id,
                        "created_at": content.created_at
                    }
                    for content in section.contents
                ]
            }
            for section in db_course.sections
        ],
        "assignments": [
            {
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "due_date": assignment.due_date,
                "max_score": assignment.max_score,
                "created_at": assignment.created_at
            }
            for assignment in db_course.assignments
        ],
        "is_enrolled": is_enrolled,
        "enrollment_status": enrollment_status
    }
    
    return response_data


@router.post("/course/{course_id}/request-enrollment", tags=["student"])
async def request_enrollment(
    course_id: int,
    db: AsyncSession = Depends(get_async_db),
    student = Depends(get_student_user)
):
    """Student requests to enroll in a course"""
    enrollment = await request_enrollment_util(db, student.id, course_id)
    return {"message": "Enrollment request submitted", "enrollment": enrollment}