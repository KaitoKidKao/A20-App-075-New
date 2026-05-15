from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
from src.backend.database import get_session
from src.backend.auth import get_current_user
from src.backend.models import Category, Course, Module, Lesson, User
from src.backend.utils.datetime_utils import utc_now

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _role_name(user: User) -> str:
    return (user.role.name if user.role else "student").lower()


def _require_teacher_or_admin(user: User) -> None:
    if _role_name(user) not in {"teacher", "admin"}:
        raise HTTPException(status_code=403, detail="Only teacher/admin can perform this action.")


def _ensure_course_owner_or_admin(course_id: uuid.UUID, user: User, session: Session) -> Course:
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if _role_name(user) == "admin" or course.instructor_id == user.id:
        return course
    raise HTTPException(status_code=403, detail="Access denied.")


def _resolve_next_module_sort_order(course_id: uuid.UUID, session: Session) -> int:
    modules = session.exec(select(Module).where(Module.course_id == course_id)).all()
    if not modules:
        return 1
    return max((module.sort_order or 0) for module in modules) + 1

# --- Categories ---
@router.get("/categories", response_model=List[Category])
async def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.post("/categories", response_model=Category)
async def create_category(category: Category, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if _role_name(current_user) != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create categories.")
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

# --- Courses ---
@router.get("/", response_model=List[Course])
async def list_courses(category_id: uuid.UUID = None, session: Session = Depends(get_session)):
    statement = select(Course).where(Course.is_published == True)
    if category_id:
        statement = statement.where(Course.category_id == category_id)
    return session.exec(statement).all()

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: uuid.UUID, session: Session = Depends(get_session)):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=Course)
async def create_course(course: Course, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_teacher_or_admin(current_user)
    course.instructor_id = current_user.id
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

# --- Modules ---
@router.get("/{course_id}/modules", response_model=List[Module])
async def list_modules(course_id: uuid.UUID, session: Session = Depends(get_session)):
    return session.exec(select(Module).where(Module.course_id == course_id).order_by(Module.sort_order)).all()

@router.post("/{course_id}/modules", response_model=Module)
async def create_module(
    course_id: uuid.UUID,
    module: Module,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _ensure_course_owner_or_admin(course_id, current_user, session)
    module.course_id = course_id
    if module.sort_order is None or module.sort_order <= 0:
        module.sort_order = _resolve_next_module_sort_order(course_id, session)
    if module.sort_order > 2_147_483_647:
        raise HTTPException(status_code=422, detail="sort_order exceeds max INTEGER range.")
    session.add(module)
    session.commit()
    session.refresh(module)
    return module

# --- Lessons ---
@router.get("/modules/{module_id}/lessons", response_model=List[Lesson])
async def list_lessons(module_id: uuid.UUID, session: Session = Depends(get_session)):
    return session.exec(select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.sort_order)).all()

@router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: uuid.UUID, session: Session = Depends(get_session)):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
