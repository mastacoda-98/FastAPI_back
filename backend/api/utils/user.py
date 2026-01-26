from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from db.models.user import User
from pydantic_schemas.user import UserCreate
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(db: AsyncSession, user_id: int):
    query = select(User).where(User.id == user_id).options(joinedload(User.profile))
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = select(User).offset(skip).limit(limit).options(joinedload(User.profile))
    result = await db.execute(query)
    return result.scalars().all()


async def create_user(db: AsyncSession, user: UserCreate):
    hashed = hash_password(user.password)
    db_user = User(email=user.email, role=user.role, password=hashed)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    from db.models.user import Profile
    profile = Profile(
        user_id=db_user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        bio=user.bio
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    
    return db_user


async def get_user_dashboard(db: AsyncSession, user):
    """Build dashboard data for both teacher and student"""
    from db.models.user import Role
    from db.models.course import Course, StudentCourse, Submission, EnrollmentStatus, CompletedCourse, Assignment
    from sqlalchemy import select as sql_select
    
    profile_name = ""
    if user.profile:
        profile_name = f"{user.profile.first_name or ''} {user.profile.last_name or ''}".strip()
    
    role_str = "teacher" if user.role == Role.teacher else "student"
    
    dashboard = {
        "id": user.id,
        "email": user.email,
        "role": role_str,
        "profile_name": profile_name,
        "created_at": user.created_at,
    }
    
    # Teacher specific data
    if user.role == Role.teacher:
        courses_result = await db.execute(
            sql_select(Course).where(Course.user_id == user.id)
        )
        courses = courses_result.scalars().all()
        
        pending_result = await db.execute(
            sql_select(StudentCourse).where(
                (StudentCourse.status == EnrollmentStatus.pending) &
                (StudentCourse.course_id.in_([c.id for c in courses]))
            )
        )
        pending_enrollments = pending_result.scalars().all()
        
        courses_info = []
        total_students = 0
        for course in courses:
            enrolled_result = await db.execute(
                sql_select(StudentCourse).where(
                    (StudentCourse.course_id == course.id) &
                    (StudentCourse.status.in_([EnrollmentStatus.approved, EnrollmentStatus.direct]))
                )
            )
            enrolled = enrolled_result.scalars().all()
            total_students += len(enrolled)
            
            pending_course_result = await db.execute(
                sql_select(StudentCourse).where(
                    (StudentCourse.course_id == course.id) &
                    (StudentCourse.status == EnrollmentStatus.pending)
                )
            )
            pending_course = len(pending_course_result.scalars().all())
            
            courses_info.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "created_at": course.created_at,
                "total_students": len(enrolled),
                "pending_requests": pending_course
            })
        
        pending_list = []
        for enrollment in pending_enrollments:
            student = await db.get(User, enrollment.student_id)
            course = await db.get(Course, enrollment.course_id)
            pending_list.append({
                "enrollment_id": enrollment.id,
                "student_email": student.email,
                "course_title": course.title,
                "requested_at": enrollment.created_at
            })
        
        dashboard.update({
            "courses_created": courses_info,
            "total_students_enrolled": total_students,
            "total_pending_requests": len(pending_enrollments),
            "pending_enrollments": pending_list
        })
    
    # Student specific data
    else:
        enrollments_result = await db.execute(
            sql_select(StudentCourse).where(StudentCourse.student_id == user.id)
        )
        all_enrollments = enrollments_result.scalars().all()
        
        approved_enrollments = [e for e in all_enrollments if e.status in [EnrollmentStatus.approved, EnrollmentStatus.direct]]
        pending_enrollments = [e for e in all_enrollments if e.status == EnrollmentStatus.pending]
        
        enrolled_courses = []
        total_completion = 0
        
        for enrollment in approved_enrollments:
            course = await db.get(Course, enrollment.course_id)
            teacher = await db.get(User, course.user_id)
            
            teacher_name = ""
            if teacher.profile:
                teacher_name = f"{teacher.profile.first_name or ''} {teacher.profile.last_name or ''}".strip()
            
            assignments_result = await db.execute(
                sql_select(Assignment).where(Assignment.course_id == course.id)
            )
            assignments = assignments_result.scalars().all()
            
            completed_submissions = 0
            total_submissions = len(assignments)
            if assignments:
                submissions_result = await db.execute(
                    sql_select(Submission).where(
                        (Submission.student_id == user.id) &
                        (Submission.assignment_id.in_([a.id for a in assignments]))
                    )
                )
                submissions = submissions_result.scalars().all()
                completed_submissions = len([s for s in submissions if s.score is not None])
            
            completion_result = await db.execute(
                sql_select(CompletedCourse).where(
                    (CompletedCourse.student_id == user.id) &
                    (CompletedCourse.course_id == course.id)
                )
            )
            completion = completion_result.scalar()
            completion_percentage = completion.completion_percentage if completion else 0
            total_completion += completion_percentage
            
            enrolled_courses.append({
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "teacher_name": teacher_name,
                "teacher_email": teacher.email,
                "status": enrollment.status,
                "completed": enrollment.completed,
                "completion_percentage": completion_percentage,
                "enrolled_at": enrollment.created_at,
                "total_assignments": total_submissions,
                "completed_assignments": completed_submissions
            })
        
        avg_completion = int(total_completion / len(approved_enrollments)) if approved_enrollments else 0
        completed_courses = len([e for e in approved_enrollments if e.completed])
        
        pending_list = []
        for enrollment in pending_enrollments:
            course = await db.get(Course, enrollment.course_id)
            pending_list.append({
                "course_id": course.id,
                "course_title": course.title,
                "requested_at": enrollment.created_at,
                "status": enrollment.status
            })
        
        dashboard.update({
            "enrolled_courses": enrolled_courses,
            "total_courses_enrolled": len(approved_enrollments),
            "total_courses_approved": len(approved_enrollments),
            "total_courses_pending": len(pending_enrollments),
            "total_courses_completed": completed_courses,
            "overall_completion_percentage": avg_completion,
            "pending_requests": pending_list
        })
    
    return dashboard


async def request_enrollment_util(db: AsyncSession, student_id: int, course_id: int):
    """Student requests to enroll in a course"""
    from db.models.course import Course, StudentCourse, EnrollmentStatus
    from fastapi import HTTPException
    
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = await db.execute(
        select(StudentCourse).where(
            (StudentCourse.student_id == student_id) &
            (StudentCourse.course_id == course_id)
        )
    )
    if existing.scalar():
        raise HTTPException(status_code=400, detail="Already enrolled or requested")

    enrollment = StudentCourse(
        student_id=student_id,
        course_id=course_id,
        enrolled_by=None,
        status=EnrollmentStatus.pending
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def enroll_student_util(db: AsyncSession, teacher_id: int, course_id: int, student_id: int):
    """Teacher directly enrolls a student to their course"""
    from db.models.course import Course, StudentCourse, EnrollmentStatus
    from fastapi import HTTPException
    from datetime import datetime
    
    course = await db.get(Course, course_id)
    if not course or course.user_id != teacher_id:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = await db.execute(
        select(StudentCourse).where(
            (StudentCourse.student_id == student_id) &
            (StudentCourse.course_id == course_id)
        )
    )
    if existing.scalar():
        raise HTTPException(status_code=400, detail="Student already enrolled")

    enrollment = StudentCourse(
        student_id=student_id,
        course_id=course_id,
        enrolled_by=teacher_id,
        status=EnrollmentStatus.direct,
        approved_at=datetime.utcnow()
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def approve_enrollment_util(db: AsyncSession, teacher_id: int, enrollment_id: int, approved: bool, rejected_reason: str = None):
    """Teacher approves or rejects a student enrollment request"""
    from db.models.course import Course, StudentCourse, EnrollmentStatus
    from fastapi import HTTPException
    from datetime import datetime
    
    enrollment = await db.get(StudentCourse, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    course = await db.get(Course, enrollment.course_id)
    if course.user_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this enrollment")

    if approved:
        enrollment.status = EnrollmentStatus.approved
        enrollment.enrolled_by = teacher_id
        enrollment.approved_at = datetime.utcnow()
        message = "Enrollment approved"
    else:
        enrollment.status = EnrollmentStatus.rejected
        enrollment.rejected_reason = rejected_reason
        message = "Enrollment rejected"

    await db.commit()
    await db.refresh(enrollment)
    return enrollment, message