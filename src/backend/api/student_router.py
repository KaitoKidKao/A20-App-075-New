from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from src.backend.database import get_session
from src.backend.auth import get_current_user
from src.backend.models import (
    User,
    Enrollment,
    UserProgress,
    UserFlashcardProgress,
    Lesson,
    Flashcard,
    Profile,
    Course,
    Module,
    Quiz,
    Question,
    QuestionOption,
    QuizAttempt,
    CourseReview,
)
from src.backend.utils.datetime_utils import utc_now

router = APIRouter(prefix="/api/student", tags=["student"])


def _serialize_review(review: CourseReview, user: User | None):
    return {
        "id": str(review.id),
        "course_id": str(review.course_id),
        "user_id": str(review.user_id),
        "user_name": user.full_name if user and user.full_name else (user.email.split("@")[0] if user else "User"),
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }

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
    watched_seconds: int = 0,
    last_position_seconds: int = 0,
    duration_seconds: int = 0,
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(UserProgress).where(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)
    progress = session.exec(statement).first()
    
    if not progress:
        progress = UserProgress(user_id=current_user.id, lesson_id=lesson_id)
    
    progress.progress_percent = max(0, min(100, progress_percent))
    progress.completion_status = status
    progress.watched_seconds = max(progress.watched_seconds or 0, watched_seconds)
    progress.last_position_seconds = max(0, last_position_seconds)
    if duration_seconds > 0:
        progress.duration_seconds = duration_seconds
    progress.last_accessed_at = utc_now()
    
    if status == "completed" and not progress.completed_at:
        progress.completed_at = utc_now()
        
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return progress

@router.get("/lessons/{lesson_id}/progress", response_model=Optional[UserProgress])
async def get_my_lesson_progress(lesson_id: uuid.UUID, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(UserProgress).where(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)).first()


@router.get("/dashboard")
async def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    enrollments = session.exec(select(Enrollment).where(Enrollment.user_id == current_user.id)).all()
    progress_rows = session.exec(
        select(UserProgress)
        .where(UserProgress.user_id == current_user.id)
        .order_by(UserProgress.last_accessed_at.desc())
    ).all()
    quiz_attempts = session.exec(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.created_at.desc())
        .limit(10)
    ).all()
    flashcard_progress = session.exec(
        select(UserFlashcardProgress).where(UserFlashcardProgress.user_id == current_user.id)
    ).all()

    course_cards = []
    for enrollment in enrollments:
        course = session.get(Course, enrollment.course_id)
        if not course:
            continue
        modules = session.exec(select(Module).where(Module.course_id == course.id)).all()
        module_ids = [m.id for m in modules]
        lessons = session.exec(select(Lesson).where(Lesson.module_id.in_(module_ids))).all() if module_ids else []
        lesson_ids = {lesson.id for lesson in lessons}
        course_progress = [p for p in progress_rows if p.lesson_id in lesson_ids]
        completed = [p for p in course_progress if p.completion_status == "completed"]
        percent = round((len(completed) / len(lessons)) * 100) if lessons else 0
        course_cards.append(
            {
                "course_id": str(course.id),
                "title": course.title,
                "thumbnail_url": course.thumbnail_url,
                "enrollment_status": enrollment.enrollment_status,
                "total_lessons": len(lessons),
                "completed_lessons": len(completed),
                "progress_percent": percent,
            }
        )

    incomplete_lessons = []
    for progress in progress_rows:
        if progress.completion_status == "completed":
            continue
        lesson = session.get(Lesson, progress.lesson_id)
        if not lesson:
            continue
        incomplete_lessons.append(
            {
                "lesson_id": str(lesson.id),
                "title": lesson.title,
                "progress_percent": progress.progress_percent,
                "last_position_seconds": progress.last_position_seconds,
                "last_accessed_at": progress.last_accessed_at,
            }
        )

    recent_quizzes = []
    for attempt in quiz_attempts:
        quiz = session.get(Quiz, attempt.quiz_id)
        recent_quizzes.append(
            {
                "quiz_id": str(attempt.quiz_id),
                "title": quiz.title if quiz else "Quiz",
                "score": float(attempt.score),
                "status": attempt.status,
                "created_at": attempt.created_at,
            }
        )

    total_watch_seconds = sum(p.watched_seconds or 0 for p in progress_rows)
    return {
        "stats": {
            "active_courses": len([e for e in enrollments if e.enrollment_status == "active"]),
            "completed_lessons": len([p for p in progress_rows if p.completion_status == "completed"]),
            "total_watch_seconds": total_watch_seconds,
            "learned_flashcards": len([p for p in flashcard_progress if p.status == "learned"]),
            "average_quiz_score": round(
                sum(float(a.score) for a in quiz_attempts) / len(quiz_attempts),
                1,
            ) if quiz_attempts else 0,
        },
        "courses": course_cards,
        "incomplete_lessons": incomplete_lessons[:8],
        "quiz_scores": recent_quizzes,
        "recent_activity": [
            {
                "type": "lesson_progress",
                "lesson_id": str(p.lesson_id),
                "progress_percent": p.progress_percent,
                "last_accessed_at": p.last_accessed_at,
            }
            for p in progress_rows[:10]
        ],
    }


@router.get("/courses/{course_id}/detail")
async def get_course_detail(
    course_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, course_id)
    if not course or course.is_deleted:
        raise HTTPException(status_code=404, detail="Course not found.")

    modules = session.exec(
        select(Module).where(Module.course_id == course_id).order_by(Module.sort_order, Module.created_at)
    ).all()
    module_ids = [m.id for m in modules]
    lessons = session.exec(
        select(Lesson).where(Lesson.module_id.in_(module_ids)).order_by(Lesson.sort_order, Lesson.created_at)
    ).all() if module_ids else []

    lesson_by_module: dict[uuid.UUID, list[Lesson]] = {}
    for lesson in lessons:
        lesson_by_module.setdefault(lesson.module_id, []).append(lesson)

    enrollment = session.exec(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id,
        )
    ).first()
    total_enrolled = session.exec(
        select(func.count()).select_from(Enrollment).where(Enrollment.course_id == course_id)
    ).one()

    lesson_ids = [l.id for l in lessons]
    progress_rows = session.exec(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.lesson_id.in_(lesson_ids),
        )
    ).all() if lesson_ids else []
    progress_map = {row.lesson_id: row for row in progress_rows}
    completed_count = len([p for p in progress_rows if p.completion_status == "completed"])
    progress_percent = round((completed_count / len(lesson_ids)) * 100) if lesson_ids else 0
    is_course_completed = bool(lesson_ids) and completed_count >= len(lesson_ids)

    first_lesson_id = str(lessons[0].id) if lessons else None
    next_lesson_id = None
    for lesson in lessons:
        p = progress_map.get(lesson.id)
        if not p or p.completion_status != "completed":
            next_lesson_id = str(lesson.id)
            break

    total_duration_minutes = sum(max(int(l.duration_minutes or 0), 0) for l in lessons)
    transcript_ready_lessons = len([l for l in lessons if (l.status or "").lower() == "completed"])
    processing_lessons = len([l for l in lessons if (l.status or "").lower() in {"queued", "processing"}])
    reviews = session.exec(
        select(CourseReview).where(CourseReview.course_id == course_id).order_by(CourseReview.updated_at.desc())
    ).all()
    rating_count = len(reviews)
    avg_rating = round(sum(r.rating for r in reviews) / rating_count, 2) if rating_count else 0.0
    dist = {i: 0 for i in range(1, 6)}
    for r in reviews:
        if r.rating in dist:
            dist[r.rating] += 1

    return {
        "course": {
            "id": str(course.id),
            "title": course.title,
            "description": course.description,
            "thumbnail_url": course.thumbnail_url,
            "language": course.language,
            "level": course.level,
            "is_published": course.is_published,
            "instructor_id": str(course.instructor_id) if course.instructor_id else None,
        },
        "stats": {
            "students_enrolled": int(total_enrolled or 0),
            "total_modules": len(modules),
            "total_lessons": len(lessons),
            "total_duration_minutes": total_duration_minutes,
            "rating_avg": avg_rating,
            "rating_count": rating_count,
            "rating_distribution": dist,
            "transcript_ready_lessons": transcript_ready_lessons,
            "processing_lessons": processing_lessons,
        },
        "user_context": {
            "is_enrolled": bool(enrollment),
            "enrollment_status": enrollment.enrollment_status if enrollment else "not_enrolled",
            "progress_percent": progress_percent,
            "completed_lessons": completed_count,
            "is_course_completed": is_course_completed,
            "first_lesson_id": first_lesson_id,
            "next_lesson_id": next_lesson_id or first_lesson_id,
        },
        "modules": [
            {
                "id": str(module.id),
                "title": module.title,
                "description": module.description,
                "sort_order": module.sort_order,
                "lessons": [
                    {
                        "id": str(lesson.id),
                        "title": lesson.title,
                        "content_type": lesson.content_type,
                        "status": lesson.status,
                        "sort_order": lesson.sort_order,
                        "duration_minutes": lesson.duration_minutes,
                        "progress_percent": int((progress_map.get(lesson.id).progress_percent if progress_map.get(lesson.id) else 0) or 0),
                        "completion_status": (progress_map.get(lesson.id).completion_status if progress_map.get(lesson.id) else "not_started"),
                        "is_completed": bool(
                            progress_map.get(lesson.id)
                            and progress_map[lesson.id].completion_status == "completed"
                        ),
                    }
                    for lesson in lesson_by_module.get(module.id, [])
                ],
            }
            for module in modules
        ],
    }


@router.get("/courses/{course_id}/reviews")
async def list_course_reviews(
    course_id: uuid.UUID,
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    safe_limit = max(1, min(limit, 100))
    safe_offset = max(0, offset)
    course = session.get(Course, course_id)
    if not course or course.is_deleted:
        raise HTTPException(status_code=404, detail="Course not found.")

    rows = session.exec(
        select(CourseReview)
        .where(CourseReview.course_id == course_id)
        .order_by(CourseReview.updated_at.desc())
        .offset(safe_offset)
        .limit(safe_limit)
    ).all()
    users = session.exec(select(User).where(User.id.in_([r.user_id for r in rows]))).all() if rows else []
    user_map = {u.id: u for u in users}
    return {
        "items": [_serialize_review(r, user_map.get(r.user_id)) for r in rows],
        "limit": safe_limit,
        "offset": safe_offset,
    }


@router.post("/courses/{course_id}/reviews")
async def create_or_update_course_review(
    course_id: uuid.UUID,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, course_id)
    if not course or course.is_deleted:
        raise HTTPException(status_code=404, detail="Course not found.")

    rating_raw = data.get("rating")
    comment = str(data.get("comment") or "").strip()
    try:
        rating = int(rating_raw)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="rating must be an integer from 1 to 5.")
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="rating must be in range 1..5.")
    if len(comment) > 2000:
        raise HTTPException(status_code=400, detail="comment is too long (max 2000 chars).")

    existing = session.exec(
        select(CourseReview).where(
            CourseReview.course_id == course_id,
            CourseReview.user_id == current_user.id,
        )
    ).first()
    if existing:
        existing.rating = rating
        existing.comment = comment
        existing.updated_at = utc_now()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return _serialize_review(existing, current_user)

    review = CourseReview(
        course_id=course_id,
        user_id=current_user.id,
        rating=rating,
        comment=comment,
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return _serialize_review(review, current_user)

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
    progress.next_review_at = utc_now() + timedelta(days=interval_days)
    progress.last_reviewed_at = utc_now()
    progress.review_count = (progress.review_count or 0) + 1
    if is_correct:
        progress.correct_count = (progress.correct_count or 0) + 1
    else:
        progress.incorrect_count = (progress.incorrect_count or 0) + 1
    progress.status = "learned" if progress.box_level >= 4 and is_correct else "learning"
    
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return {
        "next_review_at": progress.next_review_at,
        "box_level": progress.box_level,
        "status": progress.status,
        "review_count": progress.review_count,
    }


@router.get("/lessons/{lesson_id}/quizzes")
async def list_lesson_quizzes(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    quizzes = session.exec(select(Quiz).where(Quiz.lesson_id == lesson_id)).all()
    result = []
    for quiz in quizzes:
        questions = session.exec(
            select(Question).where(Question.quiz_id == quiz.id).order_by(Question.sort_order)
        ).all()
        result.append(
            {
                "id": str(quiz.id),
                "lesson_id": str(quiz.lesson_id),
                "title": quiz.title,
                "passing_score": quiz.passing_score,
                "questions": [
                    {
                        "id": str(question.id),
                        "question_text": question.question_text,
                        "explanation": question.explanation,
                        "difficulty": question.difficulty,
                        "options": [
                            {
                                "id": str(option.id),
                                "option_text": option.option_text,
                            }
                            for option in session.exec(
                                select(QuestionOption).where(QuestionOption.question_id == question.id)
                            ).all()
                        ],
                    }
                    for question in questions
                ],
            }
        )
    return {"lesson_id": str(lesson_id), "quizzes": result}


@router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz_attempt(
    quiz_id: uuid.UUID,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Khong tim thay quiz.")

    answers = data.get("answers", {})
    if not isinstance(answers, dict):
        raise HTTPException(status_code=400, detail="answers phai la object question_id -> option_id.")

    questions = session.exec(select(Question).where(Question.quiz_id == quiz_id)).all()
    total = len(questions)
    correct = 0
    details = []

    for question in questions:
        selected = answers.get(str(question.id))
        correct_option = session.exec(
            select(QuestionOption).where(
                QuestionOption.question_id == question.id,
                QuestionOption.is_correct == True,
            )
        ).first()
        is_correct = bool(correct_option and selected == str(correct_option.id))
        if is_correct:
            correct += 1
        details.append(
            {
                "question_id": str(question.id),
                "selected_option_id": selected,
                "correct_option_id": str(correct_option.id) if correct_option else None,
                "is_correct": is_correct,
            }
        )

    score = Decimal(str(round((correct / total) * 100, 2))) if total else Decimal("0")
    status = "passed" if score >= quiz.passing_score else "failed"
    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score=score,
        status=status,
        answers_json={"answers": answers, "details": details},
    )
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return {
        "attempt_id": str(attempt.id),
        "quiz_id": str(quiz.id),
        "score": float(attempt.score),
        "status": attempt.status,
        "correct": correct,
        "total": total,
        "details": details,
    }
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
