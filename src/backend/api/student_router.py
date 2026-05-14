from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime
from src.backend.database import get_session
from src.backend.auth import get_current_user
from src.backend.models import User, Enrollment, UserProgress, UserFlashcardProgress, Lesson, Flashcard, Profile, Course, Module
from src.backend.utils.datetime_utils import utc_now

router = APIRouter(prefix="/api/student", tags=["student"])

# --- Enrollment ---
@router.post("/enroll/{course_id}", response_model=Enrollment)
async def enroll_in_course(course_id: uuid.UUID, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Check if already enrolled
    existing = session.exec(select(Enrollment).where(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)).first()
    if existing:
        return existing
    
    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment

@router.get("/my-courses", response_model=List[Enrollment])
async def list_my_enrollments(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Enrollment).where(Enrollment.user_id == current_user.id)).all()

# --- Progress Tracking ---
@router.post("/lessons/{lesson_id}/progress")
async def update_progress(
    lesson_id: uuid.UUID, 
    progress_percent: int, 
    status: str = "in_progress",
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(UserProgress).where(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)
    progress = session.exec(statement).first()
    
    if not progress:
        progress = UserProgress(user_id=current_user.id, lesson_id=lesson_id)
    
    progress.progress_percent = progress_percent
    progress.completion_status = status
    progress.last_accessed_at = utc_now()
    
    if status == "completed" and not progress.completed_at:
        progress.completed_at = utc_now()
        
    session.add(progress)
    session.commit()
    return {"message": "Progress updated"}

@router.get("/lessons/{lesson_id}/progress", response_model=Optional[UserProgress])
async def get_my_lesson_progress(lesson_id: uuid.UUID, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(UserProgress).where(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)).first()

# --- SRS Flashcards ---
@router.get("/flashcards/due", response_model=List[Flashcard])
async def get_due_flashcards(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Get flashcards where next_review_at <= now
    statement = select(Flashcard).join(UserFlashcardProgress).where(
        UserFlashcardProgress.user_id == current_user.id,
        UserFlashcardProgress.next_review_at <= utc_now()
    )
    return session.exec(statement).all()

@router.post("/flashcards/{flashcard_id}/review")
async def review_flashcard(
    flashcard_id: uuid.UUID, 
    is_correct: bool, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(UserFlashcardProgress).where(
        UserFlashcardProgress.user_id == current_user.id, 
        UserFlashcardProgress.flashcard_id == flashcard_id
    )
    progress = session.exec(statement).first()
    
    if not progress:
        progress = UserFlashcardProgress(user_id=current_user.id, flashcard_id=flashcard_id)
    
    # Leitner System logic (simplified)
    if is_correct:
        progress.box_level = min(progress.box_level + 1, 5)
    else:
        progress.box_level = 1
        
    # Interval in days: 1, 2, 4, 8, 16
    interval_days = 2 ** (progress.box_level - 1)
    from datetime import timedelta
    progress.next_review_at = utc_now() + timedelta(days=interval_days)
    progress.last_reviewed_at = utc_now()
    
    session.add(progress)
    session.commit()
    return {"next_review_at": progress.next_review_at}
# --- Profile & Certificates ---
@router.get("/profile")
async def get_student_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    
    # Calculate stats
    enrollments = session.exec(select(Enrollment).where(Enrollment.user_id == current_user.id)).all()
    completed_lessons = session.exec(select(UserProgress).where(
        UserProgress.user_id == current_user.id, 
        UserProgress.completion_status == "completed"
    )).all()
    
    return {
        "profile": profile,
        "stats": {
            "total_enrollments": len(enrollments),
            "completed_lessons": len(completed_lessons),
            "total_hours": round(len(completed_lessons) * 0.5, 1), # Mocked
            "certificates_count": len(profile.certifications) if profile.certifications else 0
        }
    }

@router.put("/profile")
async def update_profile(
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
    
    for key, val in data.items():
        if hasattr(profile, key) and key != "id":
            setattr(profile, key, val)
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

@router.get("/courses/{course_id}/certificate")
async def get_course_certificate(
    course_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if all lessons in course are completed
    modules = session.exec(select(Module).where(Module.course_id == course_id)).all()
    module_ids = [m.id for m in modules]
    lessons = session.exec(select(Lesson).where(Lesson.module_id.in_(module_ids))).all()
    lesson_ids = [l.id for l in lessons]
    
    if not lesson_ids:
        raise HTTPException(status_code=400, detail="Khóa học chưa có bài học nào.")

    completed = session.exec(select(UserProgress).where(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id.in_(lesson_ids),
        UserProgress.completion_status == "completed"
    )).all()
    
    if len(completed) < len(lessons):
        raise HTTPException(status_code=400, detail=f"Chưa hoàn thành tất cả bài học ({len(completed)}/{len(lessons)}).")
    
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    certs = list(profile.certifications) if profile.certifications else []
    
    course = session.get(Course, course_id)
    cert_id = f"CERT-{str(course_id)[:8]}-{str(current_user.id)[:8]}".upper()
    
    if not any(c.get("course_id") == str(course_id) for c in certs):
        certs.append({
            "cert_id": cert_id,
            "course_id": str(course_id),
            "course_title": course.title,
            "issue_date": datetime.utcnow().isoformat()
        })
        profile.certifications = certs
        session.add(profile)
        session.commit()
    
    return next(c for c in certs if c["course_id"] == str(course_id))
