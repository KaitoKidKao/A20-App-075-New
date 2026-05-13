from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session

from src.backend.api.deps import check_video_access
from src.backend.auth import get_current_user
from src.backend.database import get_session
from src.backend.models import User
from src.backend.services.avatar_video_service import AvatarVideoService

router = APIRouter(prefix="/api", tags=["avatar"])


@router.get("/avatar-video/{video_id}")
async def serve_avatar_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    video_path = AvatarVideoService.get_avatar_video_path(video_id)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Avatar video file not found.")
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=f"{video_id}_avatar.mp4",
    )
