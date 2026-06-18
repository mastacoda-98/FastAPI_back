from sqlalchemy import select, func, delete, or_, desc, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models.course import (
    Course,
    StudentCourse,
    EnrollmentStatus,
    Section,
    Content,
    Assignment,
    Submission,
    CompletedCourse,
    Announcement,
    Comment,
)
from db.models.user import User
from pydantic_schemas.course import CourseCreate


async def get_course(db: AsyncSession, course_id: int):
    query = select(Course).where(Course.id == course_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_courses(db: AsyncSession):
    query = select(Course).options(selectinload(Course.creator).selectinload(User.profile))
    result = await db.execute(query)
    courses = result.scalars().all()
    return await hydrate_course_list_metadata(db, courses)


async def hydrate_course_list_metadata(db: AsyncSession, courses):
    for course in courses:
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


async def search_courses(
    db: AsyncSession,
    q: str | None = None,
    skip: int = 0,
    limit: int = 100,
    min_similarity: float = 0.15,
    teacher_id: int | None = None,
    sort: str = "relevance",
):
    normalized_query = q.strip().lower() if q else ""
    query = select(Course).options(selectinload(Course.creator).selectinload(User.profile))

    if teacher_id is not None:
        query = query.where(Course.user_id == teacher_id)

    if normalized_query:
        title = func.lower(func.coalesce(Course.title, ""))
        description = func.lower(func.coalesce(Course.description, ""))
        title_similarity = func.similarity(title, normalized_query)
        description_similarity = func.similarity(description, normalized_query)
        relevance = (
            title_similarity * 3.0
            + description_similarity
            + case((title == normalized_query, 2.0), else_=0.0)
            + case((title.ilike(f"%{normalized_query}%"), 0.75), else_=0.0)
            + case((description.ilike(f"%{normalized_query}%"), 0.25), else_=0.0)
        )

        query = query.where(
            or_(
                title_similarity >= min_similarity,
                description_similarity >= min_similarity,
                title.ilike(f"%{normalized_query}%"),
                description.ilike(f"%{normalized_query}%"),
            )
        )

        if sort == "newest":
            query = query.order_by(desc(Course.created_at))
        else:
            query = query.order_by(desc(relevance), desc(title_similarity), desc(Course.created_at))
    else:
        query = query.order_by(desc(Course.created_at))

    result = await db.execute(query.offset(skip).limit(limit))
    courses = result.scalars().all()
    return await hydrate_course_list_metadata(db, courses)

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

async def delete_course(db: AsyncSession, course_id: int, teacher_id: int):
    query = select(Course).where(
        (Course.id == course_id) &
        (Course.user_id == teacher_id)
    )
    result = await db.execute(query)
    course = result.scalar_one_or_none()
    
    if course is None:
        return False

    section_ids = select(Section.id).where(Section.course_id == course_id)
    content_ids = select(Content.id).where(Content.section_id.in_(section_ids))
    assignment_ids = select(Assignment.id).where(Assignment.course_id == course_id)

    await db.execute(
        delete(Comment)
        .where(Comment.content_id.in_(content_ids))
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Content)
        .where(Content.section_id.in_(section_ids))
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Section)
        .where(Section.course_id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Submission)
        .where(Submission.assignment_id.in_(assignment_ids))
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Assignment)
        .where(Assignment.course_id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(StudentCourse)
        .where(StudentCourse.course_id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(CompletedCourse)
        .where(CompletedCourse.course_id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Announcement)
        .where(Announcement.course_id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.execute(
        delete(Course)
        .where(Course.id == course_id)
        .execution_options(synchronize_session=False)
    )
    await db.commit()
    return True
