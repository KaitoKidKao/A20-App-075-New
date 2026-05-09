from fastapi.testclient import TestClient

def test_get_my_profile(client: TestClient, student_token, test_student):
    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == test_student.email
    assert response.json()["full_name"] == test_student.full_name

def test_update_my_profile(client: TestClient, student_token):
    response = client.patch("/api/users/me", headers={"Authorization": f"Bearer {student_token}"}, json={
        "full_name": "Updated Name"
    })
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"

def test_list_users_as_admin(client: TestClient, admin_token, test_student):
    response = client.get("/api/users/", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_list_users_as_student(client: TestClient, student_token):
    response = client.get("/api/users/", headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 403

def test_delete_user_as_admin(client: TestClient, admin_token, test_student):
    response = client.delete(f"/api/users/{test_student.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert "thành công" in response.json()["message"]

def test_delete_admin_as_admin(client: TestClient, admin_token, test_admin):
    response = client.delete(f"/api/users/{test_admin.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Không thể xóa tài khoản Admin."
