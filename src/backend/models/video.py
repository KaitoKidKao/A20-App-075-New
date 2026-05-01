from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class Video(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str
    storage_path: str
    status: str = "queued" # "queued", "processing", "completed", "failed"
    created_at: datetime = Field(default_factory=datetime.utcnow)
