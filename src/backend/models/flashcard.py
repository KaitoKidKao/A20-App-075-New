from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class Flashcard(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    video_id: str = Field(foreign_key="video.id", index=True)
    front: str
    back: str
    hint: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
