import sys
import os
# Thêm thư mục gốc của dự án vào sys.path để có thể import src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import SQLModel
from src.backend.database import engine
from sqlalchemy import text

def reset_database():
    print("Đang xóa toàn bộ các bảng trong database...")
    try:
        with engine.connect() as conn:
            # Tắt check foreign key để xóa cho dễ (nếu là Postgres)
            if engine.url.drivername.startswith("postgresql"):
                 conn.execute(text("DROP SCHEMA public CASCADE;"))
                 conn.execute(text("CREATE SCHEMA public;"))
                 conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            else:
                SQLModel.metadata.drop_all(engine)
            conn.commit()
        print("Đã xóa sạch database.")
    except Exception as e:
        print(f"Lỗi khi reset database: {e}")

if __name__ == "__main__":
    reset_database()
