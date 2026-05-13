from datetime import datetime
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel
from src.backend.utils.datetime_utils import utc_now


class ProcessingJob(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    video_id: str = Field(foreign_key="video.id", index=True)
    job_type: str = Field(default="video_pipeline", index=True)
    status: str = Field(default="queued", index=True)
    progress: int = Field(default=0)
    error_message: Optional[str] = None
    attempts: int = Field(default=0)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
