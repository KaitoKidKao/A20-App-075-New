from fastapi.testclient import TestClient

def test_register_success(client: TestClient):
    response = client.post("/api/auth/register", json={
        "email": "newuser@a20.ai",
        "password": "password123",
        "full_name": "New User"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Đăng ký thành công"
    assert "user_id" in response.json()

def test_register_duplicate_email(client: TestClient, test_student):
    response = client.post("/api/auth/register", json={
        "email": test_student.email,
        "password": "password123",
        "full_name": "Duplicate User"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email đã được sử dụng."

def test_login_success(client: TestClient, test_student):
    response = client.post("/api/auth/login", data={
        "username": test_student.email,
        "password": "studentpass"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["role"] == "student"

def test_login_failure(client: TestClient, test_student):
    response = client.post("/api/auth/login", data={
        "username": test_student.email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Email hoặc mật khẩu không chính xác."
