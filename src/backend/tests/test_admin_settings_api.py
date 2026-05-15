from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine

from src.backend.auth import create_access_token, get_password_hash
from src.backend.database import get_session
from src.backend.main import app
from src.backend.models import Role, User


def _build_client(email: str = "admin@example.com") -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    with Session(engine) as session:
        admin_role = Role(name="admin")
        student_role = Role(name="student")
        session.add(admin_role)
        session.add(student_role)
        session.commit()
        session.refresh(admin_role)
        session.refresh(student_role)

        admin = User(
            email="admin@example.com",
            password_hash=get_password_hash("Password123"),
            full_name="Admin User",
            role_id=admin_role.id,
        )
        student = User(
            email="student@example.com",
            password_hash=get_password_hash("Password123"),
            full_name="Student User",
            role_id=student_role.id,
        )
        session.add(admin)
        session.add(student)
        session.commit()

    client = TestClient(app)
    token = create_access_token(data={"sub": email})
    client.cookies.set("access_token", token)
    return client


def test_admin_can_toggle_public_role_registration_setting():
    client = _build_client()

    get_res = client.get("/api/admin/settings")
    assert get_res.status_code == 200
    assert "allow_public_role_registration" in get_res.json()

    patch_res = client.patch("/api/admin/settings", json={"allow_public_role_registration": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["allow_public_role_registration"] is True

    config_res = client.get("/api/auth/registration-config")
    assert config_res.status_code == 200
    assert config_res.json()["allow_role_registration"] is True


def test_admin_can_update_user_role():
    client = _build_client()
    users_res = client.get("/api/admin/users")
    assert users_res.status_code == 200
    users = users_res.json()
    student = next(user for user in users if user["email"] == "student@example.com")

    patch_res = client.patch(f"/api/admin/users/{student['id']}/role", json={"role": "teacher"})
    assert patch_res.status_code == 200
    assert patch_res.json()["role"] == "teacher"
