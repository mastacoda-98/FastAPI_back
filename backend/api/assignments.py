import fastapi
from typing import List
from db.db_setup import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime

from pydantic_schemas.course import SubmissionResponse, AssignmentResponse
from auth.dependencies import get_teacher_user, get_student_user
from api.utils.assignment import (
    submit_assignment_util,
    get_student_assignment_submissions,
    get_assignment_all_submissions,
    grade_submission_util,
    create_assignment_util,
    update_assignment_util,
    delete_assignment_util
)
from db.models.course import Assignment, Submission

router = fastapi.APIRouter(prefix="/assignments", tags=["assignments"])


class AssignmentCreate(BaseModel):
    title: str
    description: str = None
    due_date: datetime = None
    max_score: int = 100


class AssignmentUpdate(BaseModel):
    title: str = None
    description: str = None
    due_date: datetime = None
    max_score: int = None


class SubmissionCreate(BaseModel):
    file_url: str


# =============== TEACHER ENDPOINTS - CREATE/UPDATE/DELETE ===============

@router.post("/{course_id}/create", response_model=AssignmentResponse, tags=["teacher"])
async def create_new_assignment(
    course_id: int,
    assignment: AssignmentCreate,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher creates a new assignment for their course.
    """
    new_assignment = await create_assignment_util(
        db,
        course_id,
        teacher.id,
        assignment.title,
        assignment.description,
        assignment.due_date,
        assignment.max_score
    )
    response = {
        "id": new_assignment.id,
        "title": new_assignment.title,
        "description": new_assignment.description,
        "due_date": new_assignment.due_date,
        "max_score": new_assignment.max_score,
        "created_at": new_assignment.created_at
    }
    return response


@router.put("/{assignment_id}/update", response_model=AssignmentResponse, tags=["teacher"])
async def update_assignment(
    assignment_id: int,
    assignment: AssignmentUpdate,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher updates an assignment.
    """
    updated_assignment = await update_assignment_util(
        db,
        assignment_id,
        teacher.id,
        assignment.title,
        assignment.description,
        assignment.due_date,
        assignment.max_score
    )
    response = {
        "id": updated_assignment.id,
        "title": updated_assignment.title,
        "description": updated_assignment.description,
        "due_date": updated_assignment.due_date,
        "max_score": updated_assignment.max_score,
        "created_at": updated_assignment.created_at
    }
    return response


@router.delete("/{assignment_id}/delete", tags=["teacher"])
async def delete_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher deletes an assignment.
    """
    result = await delete_assignment_util(db, assignment_id, teacher.id)
    return result


# =============== STUDENT ENDPOINTS ===============

@router.post("/{assignment_id}/submit", response_model=SubmissionResponse, tags=["student"])
async def submit_assignment(
    assignment_id: int,
    submission_data: SubmissionCreate,
    db: AsyncSession = Depends(get_async_db),
    student = Depends(get_student_user)
):
    """
    Student submits an assignment.
    Automatically validates enrollment in the course.
    """
    submission = await submit_assignment_util(db, assignment_id, student.id, submission_data.file_url)
    return submission


@router.get("/{assignment_id}/my-submission", response_model=List[SubmissionResponse], tags=["student"])
async def get_my_submission(
    assignment_id: int,
    db: AsyncSession = Depends(get_async_db),
    student = Depends(get_student_user)
):
    """
    Student views their own submission(s) for an assignment.
    """
    submissions = await get_student_assignment_submissions(db, student.id, assignment_id)
    return submissions


# =============== TEACHER ENDPOINTS ===============

@router.get("/{assignment_id}/submissions", response_model=List[SubmissionResponse], tags=["teacher"])
async def get_all_submissions(
    assignment_id: int,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher views all submissions for an assignment.
    Validates that teacher owns the course.
    """
    # Verify teacher owns the assignment's course
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    from db.models.course import Course
    course = await db.get(Course, assignment.course_id)
    if not course or course.user_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view submissions for this assignment"
        )
    
    submissions = await get_assignment_all_submissions(db, assignment_id)
    return submissions


@router.patch("/submissions/{submission_id}/grade", response_model=SubmissionResponse, tags=["teacher"])
async def grade_submission(
    submission_id: int,
    score: int,
    feedback: str = None,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher grades a student submission.
    Validates that teacher owns the course and score is within assignment max_score.
    """
    submission = await grade_submission_util(db, submission_id, teacher.id, score, feedback)
    return submission
