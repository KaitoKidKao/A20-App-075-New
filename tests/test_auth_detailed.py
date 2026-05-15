import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from src.backend.models.user import User

def test_register_success(client: TestClient, session: Session):
    response = client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "StrongPassword123",
        "confirm_password": "StrongPassword123",
        "full_name": "New User",
        "role": "student"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Registration successful"
    
    # Verify in DB
    statement = select(User).where(User.email == "newuser@example.com")
    user = session.exec(statement).first()
    assert user is not None
    assert user.full_name == "New User"
    assert user.password_hash != "strongpassword123" # Should be hashed

def test_register_duplicate_email(client: TestClient, test_student):
    # Try to register with the same email as test_student
    response = client.post("/api/auth/register", json={
        "email": test_student.email,
        "password": "StrongPassword123",
        "confirm_password": "StrongPassword123",
        "full_name": "Duplicate User",
        "role": "student"
    })
    assert response.status_code == 400
    assert "Email is already in use" in response.json()["detail"]

def test_login_success(client: TestClient, test_student):
    response = client.post("/api/auth/login", data={
        "username": test_student.email,
        "password": "studentpass"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient, test_student):
    response = client.post("/api/auth/login", data={
        "username": test_student.email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_access_protected_route_without_token(client: TestClient):
    response = client.get("/api/videos/me")
    assert response.status_code == 401

def test_rbac_user_access_other_video(client: TestClient, student_token, session: Session):
    # Create another user and their video
    user2 = User(email="user2@example.com", password_hash="hash", full_name="User 2")
    session.add(user2)
    session.commit()
    session.refresh(user2)
    
    from src.backend.models.video import Video
    video2 = Video(id="video2-id", title="Private Video", storage_path="path", user_id=user2.id)
    session.add(video2)
    session.commit()
    
    # Try to access video2 with student_token (which belongs to test_student)
    response = client.get(f"/api/videos/{video2.id}/status", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 403
    assert "Ban khong co quyen xem trang thai video nay" in response.json()["detail"]
