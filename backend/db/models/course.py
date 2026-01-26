from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from ..db_setup import Base
from .mixins import TimestampMixin
from .user import User


class EnrollmentStatus(enum.Enum):
    pending = "pending"   
    approved = "approved"
    rejected = "rejected"
    direct = "direct"


class ContentType(Base, TimestampMixin):
    __tablename__ = "content_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
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
    assignments = relationship("Assignment", back_populates="course")
    announcements = relationship("Announcement", back_populates="course")
    
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
    comments = relationship("Comment", back_populates="content")
    
class StudentCourse(Base, TimestampMixin):
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.pending)
    completed = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    rejected_reason = Column(Text, nullable=True)
    
    student = relationship(User, foreign_keys=[student_id], back_populates="student_courses")
    course = relationship(Course, back_populates="student_courses")
    approved_by = relationship(User, foreign_keys=[enrolled_by], back_populates="enrollments_approved")
    
class CompletedCourse(Base, TimestampMixin):
    __tablename__ = "completed_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completion_percentage = Column(Integer, default=0)

    student = relationship(User, back_populates="completed_courses")
    course = relationship("Course", back_populates="completed_students")


class Assignment(Base, TimestampMixin):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    due_date = Column(DateTime, nullable=True)
    max_score = Column(Integer, default=100)

    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base, TimestampMixin):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(500), nullable=True)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship(User, back_populates="submissions")


class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    course = relationship("Course", back_populates="announcements")
    creator = relationship(User, back_populates="announcements_created")


class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)

    content = relationship("Content", back_populates="comments")
    author = relationship(User, back_populates="comments")