from fastapi.testclient import TestClient
from unittest.mock import patch
from src.backend.models.video import Video
from src.backend.models.lecture import LectureData
from sqlmodel import Session
import pytest

@pytest.fixture
def fake_video(session: Session, test_student):
    video = Video(
        title="Test Video",
        storage_path="test_video.mp4",
        user_id=test_student.id,
        status="completed"
    )
    session.add(video)
    session.commit()
    session.refresh(video)
    
    lecture = LectureData(
        video_id=video.id,
        transcript=[{"start": 0.0, "end": 5.0, "text": "Hello world"}],
        summary={"summary": "Test summary"},
        timeline=[{"start_time": 0.0, "description": "Intro"}],
        mindmap="Test mindmap",
        quiz="Test quiz",
        slides="Test slides"
    )
    session.add(lecture)
    session.commit()
    return video

@patch("src.backend.routers.videos.download_and_run_pipeline")
def test_process_url(mock_pipeline, client: TestClient, student_token):
    response = client.post("/api/videos/process-url", headers={"Authorization": f"Bearer {student_token}"}, json={
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    })
    assert response.status_code == 200
    assert "video_id" in response.json()
    assert response.json()["message"] == "URL đã được nhận và đang chuẩn bị tải xuống."
    mock_pipeline.assert_called_once()

def test_get_my_videos(client: TestClient, student_token, fake_video):
    response = client.get("/api/videos/me", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    videos = response.json()
    assert len(videos) >= 1
    assert videos[0]["title"] == "Test Video"

def test_get_video_status(client: TestClient, student_token, fake_video):
    response = client.get(f"/api/videos/{fake_video.id}/status", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

def test_get_video_transcript(client: TestClient, student_token, fake_video):
    response = client.get(f"/api/videos/{fake_video.id}/transcript", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    transcript_data = response.json()
    assert len(transcript_data) > 0
    assert "Hello world" in transcript_data[0]["text"]

from unittest.mock import AsyncMock

@patch("src.backend.routers.videos.AIService.generate_mindmap", new_callable=AsyncMock)
def test_get_mindmap_on_demand_empty(mock_generate, client: TestClient, student_token, session: Session, fake_video):
    # Set mindmap to None to trigger on-demand generation
    lecture = session.get(LectureData, fake_video.id)
    lecture.mindmap = None
    session.add(lecture)
    session.commit()
    
    mock_generate.return_value = "Mocked Mindmap"
    
    response = client.get(f"/api/videos/{fake_video.id}/mindmap", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["mindmap"] == "Mocked Mindmap"
    mock_generate.assert_called_once()

def test_get_mindmap_on_demand_cached(client: TestClient, student_token, fake_video):
    response = client.get(f"/api/videos/{fake_video.id}/mindmap", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["mindmap"] == "Test mindmap"
    # Should not call generate_mindmap because it's already in the DB
