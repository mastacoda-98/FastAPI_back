from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime

from db.models.course import Assignment, Submission, StudentCourse, EnrollmentStatus, Course
from db.models.user import User


async def create_assignment_util(
    db: AsyncSession, 
    course_id: int, 
    teacher_id: int, 
    title: str,
    description: str = None,
    due_date: datetime = None,
    max_score: int = 100
):
    """
    Create a new assignment for a course.
    Validates that teacher owns the course.
    """
    # Verify course exists and teacher owns it
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add assignments to this course"
        )
    
    # Create assignment
    assignment = Assignment(
        title=title,
        description=description,
        course_id=course_id,
        due_date=due_date,
        max_score=max_score
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def update_assignment_util(
    db: AsyncSession, 
    assignment_id: int, 
    teacher_id: int,
    title: str = None,
    description: str = None,
    due_date: datetime = None,
    max_score: int = None
):
    """
    Update an assignment.
    Validates that teacher owns the course.
    """
    # Get assignment
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify teacher owns the course
    course = await db.get(Course, assignment.course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this assignment"
        )
    
    # Update fields
    if title:
        assignment.title = title
    if description:
        assignment.description = description
    if due_date:
        assignment.due_date = due_date
    if max_score:
        assignment.max_score = max_score
    
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def delete_assignment_util(
    db: AsyncSession, 
    assignment_id: int, 
    teacher_id: int
):
    """
    Delete an assignment.
    Validates that teacher owns the course.
    """
    # Get assignment
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify teacher owns the course
    course = await db.get(Course, assignment.course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this assignment"
        )
    
    await db.delete(assignment)
    await db.commit()
    return {"message": "Assignment deleted successfully"}


async def submit_assignment_util(
    db: AsyncSession, 
    assignment_id: int, 
    student_id: int, 
    file_url: str
):
    """
    Student submits an assignment.
    Validates that student is enrolled in the course before allowing submission.
    """
    # Get assignment
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if student is enrolled in the course (approved or direct status only)
    enrollment_query = select(StudentCourse).where(
        (StudentCourse.student_id == student_id) &
        (StudentCourse.course_id == assignment.course_id) &
        (StudentCourse.status.in_([EnrollmentStatus.approved, EnrollmentStatus.direct]))
    )
    enrollment_result = await db.execute(enrollment_query)
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )
    
    # Check if already submitted
    existing_query = select(Submission).where(
        (Submission.assignment_id == assignment_id) &
        (Submission.student_id == student_id)
    )
    existing_result = await db.execute(existing_query)
    existing_submission = existing_result.scalar_one_or_none()
    
    if existing_submission:
        # Update existing submission
        existing_submission.file_url = file_url
        existing_submission.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_submission)
        return existing_submission
    
    # Create new submission
    submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        file_url=file_url
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


async def get_student_assignment_submissions(
    db: AsyncSession, 
    student_id: int, 
    assignment_id: int
):
    """
    Get all submissions for a student on a specific assignment.
    """
    query = select(Submission).where(
        (Submission.student_id == student_id) &
        (Submission.assignment_id == assignment_id)
    )
    result = await db.execute(query)
    submissions = result.scalars().all()
    return submissions


async def get_assignment_all_submissions(
    db: AsyncSession, 
    assignment_id: int
):
    """
    Get all submissions for an assignment (teacher view).
    """
    query = select(Submission).where(
        Submission.assignment_id == assignment_id
    )
    result = await db.execute(query)
    submissions = result.scalars().all()
    return submissions


async def grade_submission_util(
    db: AsyncSession, 
    submission_id: int, 
    teacher_id: int, 
    score: int, 
    feedback: str = None
):
    """
    Teacher grades a submission.
    Validates that teacher owns the course the assignment belongs to.
    """
    # Get submission
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Get assignment
    assignment = await db.get(Assignment, submission.assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Get course and verify teacher owns it
    course = await db.get(Course, assignment.course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to grade this submission"
        )
    
    # Validate score
    if score is not None and (score < 0 or score > assignment.max_score):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Score must be between 0 and {assignment.max_score}"
        )
    
    # Update submission
    submission.score = score
    submission.feedback = feedback
    submission.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(submission)
    return submission
