from datetime import datetime
from api import sections
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from ..db_setup import Base
import enum
from .mixins import TimestampMixin
from .user import User
from sqlalchemy_utils import URLType

class ContentType(enum.Enum):
    video = 1
    article = 2
    quiz = 3
    
class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship(User)
    sections = relationship("Section", back_populates="course")
    student_courses = relationship("StudentCourse", back_populates="course")
    
class Section(Base, TimestampMixin):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="sections")
    contents = relationship("Content", back_populates="section")

class Content(Base, TimestampMixin):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    url = Column(URLType, nullable=True)
    data = Column(Text, nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)

    section = relationship("Section", back_populates="contents")
    completed_courses = relationship("CompletedCourse", back_populates="content")
    
class StudentCourse(Base, TimestampMixin):
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed = Column(Boolean, default=False)
    
    student = relationship(User, back_populates="student_courses")
    course = relationship(Course, back_populates="student_courses")
    
class CompletedCourse(Base, TimestampMixin):
    __tablename__ = "completed_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    url = Column(URLType, nullable=True)
    feedback = Column(Text, nullable=True)
    grade = Column(String(10), nullable=True)

    student = relationship(User, back_populates="completed_content")
    content = relationship("Content", back_populates="completed_courses")