from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid
from src.backend.utils.datetime_utils import utc_now

class Video(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str
    storage_path: str
    status: str = "queued" # "queued", "processing", "completed", "failed"
    created_at: datetime = Field(default_factory=utc_now)
