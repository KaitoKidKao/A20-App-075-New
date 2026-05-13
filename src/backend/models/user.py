from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid
from src.backend.utils.datetime_utils import utc_now

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: Optional[str] = None
    role: str = "student" # "admin" or "student"
    created_at: datetime = Field(default_factory=utc_now)
