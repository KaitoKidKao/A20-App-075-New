import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from src.backend.main import app
from src.backend.database import get_session
# Explicitly import all models to register them in SQLModel metadata
from src.backend.models import (
    user, course, content, progress, assessment, flashcard, job, system_setting, review, video
)
from src.backend.models.user import User, Role
from src.backend.auth import get_password_hash

from sqlalchemy.pool import StaticPool

# Create an in-memory SQLite database for testing
sqlite_url = "sqlite:///:memory:"
engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

# Override the production engine
import src.backend.database as db_module
db_module.engine = engine
db_module.DB_PATH = ":memory:"

import src.backend.main as main_module
main_module.engine = engine
from sqlmodel import Session as SQLSession
main_module.Session = SQLSession

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def session():
    with Session(engine) as session:
        yield session

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def test_admin(session: Session):
    # Ensure role exists
    admin_role = session.exec(select(Role).where(Role.name == "admin")).first()
    if not admin_role:
        admin_role = Role(name="admin")
        session.add(admin_role)
        session.commit()
        session.refresh(admin_role)
        
    admin = User(
        email="admin_test@a20.ai",
        password_hash=get_password_hash("adminpass"),
        full_name="Admin Test",
        role_id=admin_role.id
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin

@pytest.fixture
def test_student(session: Session):
    # Ensure role exists
    student_role = session.exec(select(Role).where(Role.name == "student")).first()
    if not student_role:
        student_role = Role(name="student")
        session.add(student_role)
        session.commit()
        session.refresh(student_role)
        
    student = User(
        email="student_test@a20.ai",
        password_hash=get_password_hash("studentpass"),
        full_name="Student Test",
        role_id=student_role.id
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@pytest.fixture
def admin_token(client, test_admin):
    response = client.post("/api/auth/login", data={
        "username": "admin_test@a20.ai",
        "password": "adminpass"
    })
    return response.json()["access_token"]

@pytest.fixture
def student_token(client, test_student):
    response = client.post("/api/auth/login", data={
        "username": "student_test@a20.ai",
        "password": "studentpass"
    })
    return response.json()["access_token"]
