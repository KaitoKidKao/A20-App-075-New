import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from src.backend.main import app
from src.backend.database import get_session
from src.backend.models.user import User
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
    admin = User(
        email="admin_test@a20.ai",
        password_hash=get_password_hash("adminpass"),
        full_name="Admin Test",
        role="admin"
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin

@pytest.fixture
def test_student(session: Session):
    student = User(
        email="student_test@a20.ai",
        password_hash=get_password_hash("studentpass"),
        full_name="Student Test",
        role="student"
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
