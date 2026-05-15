import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from src.backend.models.video import Video
from sqlmodel import Session, select

@patch("src.backend.api.videos_router.VideoService.save_video_stream")
@patch("src.backend.api.videos_router.enqueue_pipeline_job")
def test_upload_video_success(mock_enqueue, mock_save, client: TestClient, student_token, session: Session):
    mock_save.return_value = "/path/to/video.mp4"
    mock_enqueue.return_value = "background_tasks"
    
    file_content = b"fake video content"
    response = client.post(
        "/api/videos/upload",
        headers={"Authorization": f"Bearer {student_token}"},
        files={"file": ("test.mp4", file_content, "video/mp4")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "video_id" in data
    assert data["status"] == "processing"
    
    # Verify DB record
    video_id = data["video_id"]
    video = session.get(Video, video_id)
    assert video is not None
    assert video.status == "queued"
    assert video.title == "test.mp4"

def test_upload_invalid_format(client: TestClient, student_token):
    file_content = b"fake text content"
    response = client.post(
        "/api/videos/upload",
        headers={"Authorization": f"Bearer {student_token}"},
        files={"file": ("test.txt", file_content, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

@patch("src.backend.api.videos_router.enqueue_download_and_pipeline")
def test_process_url_success(mock_enqueue, client: TestClient, student_token, session: Session):
    mock_enqueue.return_value = "background_tasks"
    
    response = client.post(
        "/api/videos/process-url",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "video_id" in data
    
    # Verify DB record
    video_id = data["video_id"]
    video = session.get(Video, video_id)
    assert video is not None
    assert video.status == "queued"

def test_get_video_status_not_found(client: TestClient, student_token):
    response = client.get(
        "/api/videos/non-existent-id/status",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 404
    assert "Khong tim thay video" in response.json()["detail"]

def test_list_my_videos(client: TestClient, student_token, test_student, session: Session):
    # Add a video manually
    video = Video(id="v1", title="My Video", storage_path="path", user_id=test_student.id)
    session.add(video)
    session.commit()
    
    response = client.get(
        "/api/videos/me",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    videos = response.json()
    assert any(v["id"] == "v1" for v in videos)
