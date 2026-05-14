from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
from src.backend.database import get_session
from src.backend.auth import get_current_user
from src.backend.models import Category, Course, Module, Lesson, User
from src.backend.utils.datetime_utils import utc_now

router = APIRouter(prefix="/api/courses", tags=["courses"])

# --- Categories ---
@router.get("/categories", response_model=List[Category])
async def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.post("/categories", response_model=Category)
async def create_category(category: Category, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role and current_user.role.name != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can create categories.")
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

# --- Courses ---
@router.get("/", response_model=List[Course])
async def list_courses(category_id: uuid.UUID = None, session: Session = Depends(get_session)):
    statement = select(Course)
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
    # In a real app, check if user is Teacher or Admin
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
async def create_module(course_id: uuid.UUID, module: Module, session: Session = Depends(get_session)):
    module.course_id = course_id
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
