from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..db_setup import Base
from .mixins import TimestampMixin
from .user import User


class ContentType(Base, TimestampMixin):
    __tablename__ = "content_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # video, article, quiz
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    contents = relationship("Content", back_populates="type")
class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship(User, back_populates="courses_created")
    sections = relationship("Section", back_populates="course")
    student_courses = relationship("StudentCourse", back_populates="course")
    completed_students = relationship("CompletedCourse", back_populates="course")
    
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
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    content_type_id = Column(Integer, ForeignKey("content_types.id"), nullable=False)

    section = relationship("Section", back_populates="contents")
    type = relationship("ContentType", back_populates="contents")
    
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
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completion_percentage = Column(Integer, default=0)

    student = relationship(User, back_populates="completed_courses")
    course = relationship("Course", back_populates="completed_students")