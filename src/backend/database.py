from sqlmodel import create_engine, Session, SQLModel, select
import os

# Đường dẫn tới file SQLite
DB_PATH = "data/lecture_platform.db"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

sqlite_url = f"sqlite:///{DB_PATH}"

# connect_args={"check_same_thread": False} cần thiết cho SQLite khi dùng với FastAPI
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def ensure_admin_exists():
    from src.backend.models.user import User
    from src.backend import config
    from src.backend.auth import get_password_hash
    
    with Session(engine) as session:
        # Kiểm tra xem có admin nào chưa
        statement = select(User).where(User.role == "admin")
        admin = session.exec(statement).first()
        
        if not admin:
            print(f"🚀 [System] Đang khởi tạo tài khoản Admin mặc định: {config.ADMIN_EMAIL}")
            new_admin = User(
                email=config.ADMIN_EMAIL,
                password_hash=get_password_hash(config.ADMIN_PASSWORD),
                full_name="System Administrator",
                role="admin"
            )
            session.add(new_admin)
            session.commit()
        else:
            # Không làm gì nếu đã có admin (đảm bảo tính duy nhất)
            pass

def get_session():
    with Session(engine) as session:
        yield session
