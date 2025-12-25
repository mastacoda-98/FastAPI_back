from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.course import Course
from pydantic_schemas.course import CourseCreate


async def get_course(db: AsyncSession, course_id: int):
    query = select(Course).where(Course.id == course_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_courses(db: AsyncSession):
    query = select(Course)
    result = await db.execute(query)
    return result.scalars().all()

async def get_user_courses(db: AsyncSession, user_id: int):
    query = select(Course).where(Course.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()

async def create_course(db: AsyncSession, course: CourseCreate):
    db_course = Course(title=course.title,
                       description=course.description,
                       user_id =course.user_id
                       )
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    return db_course