from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from src.backend.auth import get_current_user
from src.backend.database import get_session
from src.backend.models import Course, Enrollment, Lesson, Module, ProcessingJob, User, UserProgress

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_teacher_or_admin(user: User) -> None:
    role_name = (user.role.name if user.role else "student").lower()
    if role_name not in {"teacher", "admin"}:
        raise HTTPException(status_code=403, detail="Teacher/admin access required.")


@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _require_teacher_or_admin(current_user)
    role_name = (current_user.role.name if current_user.role else "student").lower()

    course_statement = select(Course)
    if role_name != "admin":
        course_statement = course_statement.where(Course.instructor_id == current_user.id)
    courses = session.exec(course_statement).all()
    course_ids = [course.id for course in courses]

    modules = session.exec(select(Module).where(Module.course_id.in_(course_ids))).all() if course_ids else []
    module_ids = [module.id for module in modules]
    lessons = session.exec(select(Lesson).where(Lesson.module_id.in_(module_ids))).all() if module_ids else []
    lesson_ids = [lesson.id for lesson in lessons]

    enrollments = session.exec(select(Enrollment).where(Enrollment.course_id.in_(course_ids))).all() if course_ids else []
    progresses = session.exec(select(UserProgress).where(UserProgress.lesson_id.in_(lesson_ids))).all() if lesson_ids else []
    failed_job_statement = select(ProcessingJob).where(ProcessingJob.status == "failed")
    if role_name != "admin":
        failed_job_statement = failed_job_statement.where(ProcessingJob.lesson_id.in_(lesson_ids))
    failed_jobs = session.exec(
        failed_job_statement.order_by(ProcessingJob.updated_at.desc()).limit(10)
    ).all()

    popular_rows = session.exec(
        select(UserProgress.lesson_id, func.count(UserProgress.id).label("views"))
        .where(UserProgress.lesson_id.in_(lesson_ids))
        .group_by(UserProgress.lesson_id)
        .order_by(func.count(UserProgress.id).desc())
        .limit(5)
    ).all() if lesson_ids else []
    lesson_title_map = {str(lesson.id): lesson.title for lesson in lessons}

    completed = len([p for p in progresses if p.completion_status == "completed"])
    completion_rate = round((completed / len(progresses)) * 100, 1) if progresses else 0

    return {
        "stats": {
            "student_count": len({str(e.user_id) for e in enrollments}),
            "active_courses": len(courses),
            "lesson_count": len(lessons),
            "failed_video_jobs": len(failed_jobs),
            "completion_rate": completion_rate,
        },
        "failed_jobs": [
            {
                "lesson_id": str(job.lesson_id),
                "status": job.status,
                "error_message": job.error_message,
                "attempts": job.attempts,
                "updated_at": job.updated_at,
            }
            for job in failed_jobs
        ],
        "popular_lessons": [
            {
                "lesson_id": str(row[0]),
                "title": lesson_title_map.get(str(row[0]), "Lesson"),
                "views": row[1],
            }
            for row in popular_rows
        ],
        "recent_progress": [
            {
                "user_id": str(progress.user_id),
                "lesson_id": str(progress.lesson_id),
                "progress_percent": progress.progress_percent,
                "completion_status": progress.completion_status,
                "last_accessed_at": progress.last_accessed_at,
            }
            for progress in sorted(progresses, key=lambda p: p.last_accessed_at, reverse=True)[:10]
        ],
    }
