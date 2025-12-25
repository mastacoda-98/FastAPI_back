from datetime import datetime
from pydantic import BaseModel
from enum import IntEnum


class CoursesBase(BaseModel):
    title: str
    description: str
    user_id: int
    
class CourseCreate(CoursesBase):
    ...
    
class Course(CoursesBase):
    id: int
    
    class Config:
        orm_mode = True