import enum
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import null
from .mixins import TimestampMixin
from ..db_setup import Base

class Role(str, enum.Enum):
    teacher = "teacher"
    student = "student"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(Enum(Role))
    profile = relationship("Profile", uselist=False, back_populates="user")
    courses_created = relationship("Course", back_populates="creator")
    student_courses = relationship("StudentCourse", foreign_keys="StudentCourse.student_id", back_populates="student")
    enrollments_approved = relationship("StudentCourse", foreign_keys="StudentCourse.enrolled_by", back_populates="approved_by")
    completed_courses = relationship("CompletedCourse", back_populates="student")
    submissions = relationship("Submission", back_populates="student")
    announcements_created = relationship("Announcement", back_populates="creator")
    comments = relationship("Comment", back_populates="author")
    is_active = Column(Boolean, default=True, nullable=False)
    password = Column(String(255), nullable=True)
    

class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")