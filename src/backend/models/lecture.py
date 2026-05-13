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
    visual_data: Optional[Any] = Field(sa_column=Column(JSON)) # Dữ liệu cho biểu đồ (viz-data)
    cover_image_url: Optional[str] = None # URL ảnh bìa minh họa
    handsign_data: Optional[Any] = Field(sa_column=Column(JSON)) # Chuỗi từ khóa thủ ngữ (ASL Glosses)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
