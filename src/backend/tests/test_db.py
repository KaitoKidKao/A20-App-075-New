import sys
import os
# Thêm thư mục gốc vào sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from src.backend.database import create_db_and_tables, engine
from src.backend.models import User, Video, LectureData
from sqlmodel import Session, select

def test_database():
    print("🚀 Đang khởi tạo database...")
    create_db_and_tables()
    print("✅ Đã tạo các bảng thành công.")

    with Session(engine) as session:
        # 1. Test tạo User
        print("\n--- Test User ---")
        test_user = User(email="test@example.com", password_hash="hashed_password", full_name="Test User")
        session.add(test_user)
        session.commit()
        session.refresh(test_user)
        print(f"✅ Đã tạo User: {test_user.email} (ID: {test_user.id})")

        # 2. Test tạo Video
        print("\n--- Test Video ---")
        test_video = Video(user_id=test_user.id, title="Bài giảng Test", storage_path="/path/to/video.mp4")
        session.add(test_video)
        session.commit()
        session.refresh(test_video)
        print(f"✅ Đã tạo Video: {test_video.title} (ID: {test_video.id})")

        # 3. Test tạo LectureData
        print("\n--- Test LectureData ---")
        test_data = LectureData(
            video_id=test_video.id, 
            summary="Tóm tắt bài giảng mẫu",
            timeline=[{"time": 0, "title": "Giới thiệu"}]
        )
        session.add(test_data)
        session.commit()
        session.refresh(test_data)
        print(f"✅ Đã tạo LectureData cho Video ID: {test_data.video_id}")

        # 4. Truy vấn kiểm tra
        print("\n--- Kiểm tra truy vấn ---")
        statement = select(Video).where(Video.user_id == test_user.id)
        videos = session.exec(statement).all()
        print(f"🔍 Tìm thấy {len(videos)} video của user {test_user.email}")

if __name__ == "__main__":
    test_database()
