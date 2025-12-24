import enum
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import null
from .mixins import TimestampMixin

from ..db_setup import Base


class Role(enum.Enum):
    teacher = 1
    student = 2


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(Enum(Role))
    profile = relationship("Profile", uselist=False, back_populates="user")
    student_courses = relationship("StudentCourse", back_populates="student")
    completed_content = relationship("CompletedCourse", back_populates="student")
    is_active = Column(Boolean, default=True, nullable=False)

class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")