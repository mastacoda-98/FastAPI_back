import fastapi
from pydantic import BaseModel
from typing import Optional
from db.db_setup import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic_schemas.course import CourseCreate
from .utils.course import get_courses, create_course, get_course    

router = fastapi.APIRouter()

@router.get("/courses")
async def read_courses(db: Session = Depends(get_db)):
    courses = get_courses(db)
    return courses

@router.post("/course")
async def create_course_api(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = create_course(db, course)
    return db_course

@router.get("/course/:{id}")
async def read_course(db: Session = Depends(get_db)):
    course = get_course(db, id)
    return course

# @router.patch("/courses/:{id}")
# async def update_course():
#     return {"courses": []}

# @router.delete("/courses/:{id}")
# async def delete_course():
#     return {"courses": []}

# @router.get("/courses/:{id}/sections")
# async def read_course_sections():
#     return {"courses": []}