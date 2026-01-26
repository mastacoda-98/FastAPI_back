from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from db.models.course import Content, Section, Course, ContentType
from pydantic_schemas.course import ContentResponse


async def create_content_util(
    db: AsyncSession, 
    section_id: int, 
    teacher_id: int, 
    title: str,
    description: str = None,
    url: str = None,
    content_type_id: int = None
):
    """
    Create content within a section.
    Validates that teacher owns the course.
    """
    # Get section and verify it exists
    section = await db.get(Section, section_id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify teacher owns the course
    course = await db.get(Course, section.course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add content to this section"
        )
    
    # Verify content type exists if provided
    if content_type_id:
        content_type = await db.get(ContentType, content_type_id)
        if not content_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content type not found"
            )
    
    # Create content
    content = Content(
        title=title,
        description=description,
        url=url,
        section_id=section_id,
        content_type_id=content_type_id
    )
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return content


async def get_content_util(db: AsyncSession, content_id: int):
    """Get content by ID"""
    content = await db.get(Content, content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content


async def delete_content_util(db: AsyncSession, content_id: int, teacher_id: int):
    """
    Delete content.
    Validates that teacher owns the course.
    """
    content = await get_content_util(db, content_id)
    
    # Get section and course to verify ownership
    section = await db.get(Section, content.section_id)
    course = await db.get(Course, section.course_id)
    
    if not course or course.user_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this content"
        )
    
    await db.delete(content)
    await db.commit()
    return {"message": "Content deleted successfully"}
