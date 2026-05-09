import sys
import os

# Thêm thư mục gốc vào PYTHONPATH để có thể import các module trong src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from sqlmodel import Session, select
from src.backend.database import engine
from src.backend.models.user import User
from src.backend.auth import get_password_hash

def init_admin(email, password, full_name="System Admin"):
    with Session(engine) as session:
        # 1. Kiểm tra xem đã có admin nào chưa
        statement = select(User).where(User.role == "admin")
        existing_admin = session.exec(statement).first()
        
        if existing_admin:
            print(f"⚠️  Cảnh báo: Đã tồn tại tài khoản Admin ({existing_admin.email}).")
            print("Chương trình sẽ không tạo thêm admin mới để đảm bảo tính duy nhất.")
            return

        # 2. Tạo admin mới
        admin_user = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role="admin"
        )
        session.add(admin_user)
        session.commit()
        print(f"✅ Thành công: Đã khởi tạo tài khoản Admin duy nhất.")
        print(f"   - Email: {email}")
        print(f"   - Password: [Đã ẩn]")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Sử dụng: python src/backend/scripts/init_admin.py <email> <password>")
        sys.exit(1)
        
    admin_email = sys.argv[1]
    admin_password = sys.argv[2]
    init_admin(admin_email, admin_password)
