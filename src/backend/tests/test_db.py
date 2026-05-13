from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine, select

from src.backend.models import LectureData, User, Video


def test_database():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        test_user = User(
            email="test@example.com",
            password_hash="hashed_password",
            full_name="Test User",
        )
        session.add(test_user)
        session.commit()
        session.refresh(test_user)

        test_video = Video(
            user_id=test_user.id,
            title="Bai giang Test",
            storage_path="/path/to/video.mp4",
        )
        session.add(test_video)
        session.commit()
        session.refresh(test_video)

        test_data = LectureData(
            video_id=test_video.id,
            summary="Tom tat bai giang mau",
            timeline=[{"time": 0, "title": "Gioi thieu"}],
        )
        session.add(test_data)
        session.commit()

        statement = select(Video).where(Video.user_id == test_user.id)
        videos = session.exec(statement).all()

    assert len(videos) == 1
