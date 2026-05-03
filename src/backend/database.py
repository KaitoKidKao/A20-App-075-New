from sqlmodel import create_engine, Session, SQLModel
import os

# Đường dẫn tới file SQLite
DB_PATH = "data/lecture_platform.db"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

sqlite_url = f"sqlite:///{DB_PATH}"

# connect_args={"check_same_thread": False} cần thiết cho SQLite khi dùng với FastAPI
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
