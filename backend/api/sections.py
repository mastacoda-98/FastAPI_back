import fastapi
from typing import List
from db.db_setup import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel

from pydantic_schemas.course import SectionResponse, ContentResponse
from auth.dependencies import get_teacher_user
from api.utils.section import create_section_util, delete_section_util, get_sections_for_course
from api.utils.content import create_content_util, delete_content_util

router = fastapi.APIRouter(prefix="/sections", tags=["sections"])


class SectionCreate(BaseModel):
    title: str


class ContentCreate(BaseModel):
    title: str
    description: str = None
    url: str = None
    content_type_id: int = None


# =============== SECTION ENDPOINTS ===============

@router.post("/{course_id}/create", response_model=SectionResponse, tags=["teacher"])
async def create_section(
    course_id: int,
    section: SectionCreate,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher creates a new section for their course.
    """
    new_section = await create_section_util(db, course_id, teacher.id, section.title)
    response = {
        "id": new_section.id,
        "title": new_section.title,
        "contents": []
    }
    return response


@router.get("/{course_id}/all", response_model=List[SectionResponse], tags=["public"])
async def get_sections(
    course_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all sections for a course.
    """
    sections = await get_sections_for_course(db, course_id)
    response = [
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
        for section in sections
    ]
    return response


@router.delete("/{section_id}/delete", tags=["teacher"])
async def delete_section(
    section_id: int,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher deletes a section.
    """
    result = await delete_section_util(db, section_id, teacher.id)
    return result


# =============== CONTENT ENDPOINTS ===============

@router.post("/{section_id}/content/create", response_model=ContentResponse, tags=["teacher"])
async def add_content(
    section_id: int,
    content: ContentCreate,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher adds content to a section.
    """
    new_content = await create_content_util(
        db, 
        section_id, 
        teacher.id, 
        content.title,
        content.description,
        content.url,
        content.content_type_id
    )
    response = {
        "id": new_content.id,
        "title": new_content.title,
        "description": new_content.description,
        "url": new_content.url,
        "content_type_id": new_content.content_type_id,
        "created_at": new_content.created_at
    }
    return response


@router.delete("/{content_id}/delete", tags=["teacher"])
async def delete_content(
    content_id: int,
    db: AsyncSession = Depends(get_async_db),
    teacher = Depends(get_teacher_user)
):
    """
    Teacher deletes content.
    """
    result = await delete_content_util(db, content_id, teacher.id)
    return result

