from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from decimal import Decimal
from src.backend.utils.datetime_utils import utc_now

class Quiz(SQLModel, table=True):
    __tablename__ = "quizzes"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    lesson_id: uuid.UUID = Field(foreign_key="lessons.id")
    title: str = Field(nullable=False)
    passing_score: int = Field(default=80)
    time_limit_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=utc_now)
    
    lesson: "Lesson" = Relationship(back_populates="quizzes")
    questions: List["Question"] = Relationship(back_populates="quiz")
    attempts: List["QuizAttempt"] = Relationship(back_populates="quiz")

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column

class Question(SQLModel, table=True):
    __tablename__ = "questions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quiz_id: uuid.UUID = Field(foreign_key="quizzes.id")
    question_type: str = Field(default="multiple_choice")
    question_data: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    score: int = Field(default=1)
    sort_order: int = Field(default=0)
    
    quiz: Quiz = Relationship(back_populates="questions")

class QuizAttempt(SQLModel, table=True):
    __tablename__ = "quiz_attempts"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quiz_id: uuid.UUID = Field(foreign_key="quizzes.id")
    user_id: uuid.UUID = Field(foreign_key="users.id")
    score: Decimal = Field(default=0.0)
    status: str = Field(default="failed") # passed, failed
    answers_json: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=utc_now)
    
    quiz: Quiz = Relationship(back_populates="attempts")
    user: "User" = Relationship()
