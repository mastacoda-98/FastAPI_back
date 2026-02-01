from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models.course import Course, StudentCourse, EnrollmentStatus, Section, Content, Assignment
from db.models.user import User
from pydantic_schemas.course import CourseCreate


async def get_course(db: AsyncSession, course_id: int):
    query = select(Course).where(Course.id == course_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_courses(db: AsyncSession):
    from db.models.user import User
    query = select(Course).options(selectinload(Course.creator).selectinload(User.profile))
    result = await db.execute(query)
    courses = result.scalars().all()
    
    for course in courses:
        # Calculate profile_name for creator
        if course.creator and course.creator.profile:
            first_name = course.creator.profile.first_name or ""
            last_name = course.creator.profile.last_name or ""
            course.creator.profile_name = f"{first_name} {last_name}".strip() or None
        
        count_query = select(func.count(StudentCourse.id)).where(
            (StudentCourse.course_id == course.id) & 
            (StudentCourse.status.in_([EnrollmentStatus.approved, EnrollmentStatus.direct]))
        )
        count_result = await db.execute(count_query)
        course.enrolled_students_count = count_result.scalar() or 0
    
    return courses

async def get_user_courses(db: AsyncSession, user_id: int):
    query = select(Course).where(Course.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()

async def create_course(db: AsyncSession, course: CourseCreate, teacher_id: int):
    db_course = Course(
        title=course.title,
        description=course.description,
        user_id=teacher_id
    )
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    return db_course


async def get_course_with_details(db: AsyncSession, course_id: int):
    """
    Get course with all nested details: sections, contents, and assignments.
    Uses eager loading to fetch all related data in efficient queries.
    """
    query = select(Course).where(Course.id == course_id).options(
        selectinload(Course.creator).selectinload(User.profile),
        selectinload(Course.sections).selectinload(Section.contents).selectinload(Content.type),
        selectinload(Course.assignments)
    )
    result = await db.execute(query)
    course = result.unique().scalar_one_or_none()
    return course


async def check_enrollment(db: AsyncSession, student_id: int, course_id: int):
    """
    Check if a student is enrolled in a course.
    Returns the StudentCourse object if enrolled (any status).
    Returns None if not enrolled.
    """
    query = select(StudentCourse).where(
        (StudentCourse.student_id == student_id) &
        (StudentCourse.course_id == course_id)
    )
    result = await db.execute(query)
    enrollment = result.scalar_one_or_none()
    return enrollment