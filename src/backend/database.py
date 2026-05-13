import os

from sqlmodel import SQLModel, Session, create_engine

from src.backend import config

DB_PATH = "data/lecture_platform.db"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

sqlite_url = f"sqlite:///{DB_PATH}"
database_url = config.DATABASE_URL or sqlite_url

is_sqlite = database_url.startswith("sqlite")
engine_kwargs: dict = {"pool_pre_ping": True}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(database_url, **engine_kwargs)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
