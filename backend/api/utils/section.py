from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from db.models.course import Section, Course
from pydantic_schemas.course import SectionResponse


class SectionCreate:
    def __init__(self, title: str):
        self.title = title


async def create_section_util(db: AsyncSession, course_id: int, teacher_id: int, title: str):
    """
    Create a new section for a course.
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
            detail="You don't have permission to modify this course"
        )
    
    # Create section
    section = Section(
        title=title,
        course_id=course_id
    )
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


async def get_section_util(db: AsyncSession, section_id: int):
    """Get a section by ID"""
    section = await db.get(Section, section_id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    return section


async def get_sections_for_course(db: AsyncSession, course_id: int):
    """Get all sections for a course"""
    query = select(Section).where(Section.course_id == course_id)
    result = await db.execute(query)
    sections = result.scalars().all()
    return sections


async def delete_section_util(db: AsyncSession, section_id: int, teacher_id: int):
    """
    Delete a section.
    Validates that teacher owns the course.
    """
    section = await get_section_util(db, section_id)
    
    # Verify teacher owns the course
    course = await db.get(Course, section.course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this section"
        )
    
    await db.delete(section)
    await db.commit()
    return {"message": "Section deleted successfully"}
