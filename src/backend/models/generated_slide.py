from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from src.backend.utils.datetime_utils import utc_now

if TYPE_CHECKING:
    from .user import User


class GeneratedSlide(SQLModel, table=True):
    __tablename__ = "generated_slides"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    video_id: str = Field(nullable=False, index=True)
    filename: str = Field(nullable=False)
    template_id: str = Field(nullable=False)
    num_slides: int = Field(default=15)
    created_at: datetime = Field(default_factory=utc_now)

    user: Optional["User"] = Relationship()
