from typing import Optional, Any
from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime

class LectureData(SQLModel, table=True):
    video_id: str = Field(foreign_key="video.id", primary_key=True)
    transcript: Optional[Any] = Field(sa_column=Column(JSON))
    summary: Optional[Any] = Field(sa_column=Column(JSON))
    timeline: Optional[Any] = Field(sa_column=Column(JSON))
    highlights: Optional[Any] = Field(sa_column=Column(JSON))
    questions: Optional[Any] = Field(sa_column=Column(JSON))
    briefing: Optional[Any] = Field(sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=datetime.utcnow)
