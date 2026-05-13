# A20 Video Captioning & AI Analysis - Backend Service

Chào mừng bạn đến với phần Backend của dự án A20. Đây là dịch vụ lõi xử lý việc tải video, trích xuất phụ đề tự động (ASR), và phân tích nội dung bài giảng bằng AI.

## 🚀 Các Tính năng Chính

1.  **Xác thực người dùng (Authentication)**: 
    - Đăng ký, đăng nhập bảo mật với JWT (JSON Web Token).
    - Mã hóa mật khẩu bằng thuật toán Bcrypt.
2.  **Quản lý Video**:
    - Upload video trực tiếp hoặc xử lý qua URL (YouTube/Direct link).
    - Lưu trữ metadata và trạng thái xử lý bền vững trong SQLite.
3.  **Video Pipeline (Xử lý ngầm)**:
    - **ASR**: Sử dụng `Faster-Whisper` để chuyển đổi tiếng nói thành văn bản với độ chính xác cao.
    - **Audio processing**: Tự động tách âm thanh bằng FFmpeg.
4.  **Phân tích AI (OpenAI)**:
    - Tóm tắt bài giảng (Summary).
    - Trích xuất dòng thời gian thông minh (Smart Timeline/Chapters).
    - Trích xuất các điểm nhấn và lời dặn của giảng viên (Highlights).
    - Làm rõ các câu hỏi hội thoại (Questions Rephrasing).
    - Hướng dẫn định hướng trước bài học (Pre-lecture Briefing).

## 🛠️ Công nghệ sử dụng

- **Ngôn ngữ**: Python 3.12+
- **Framework**: FastAPI
- **Cơ sở dữ liệu**: SQLModel (ORM) + SQLite
- **Xử lý âm thanh**: FFmpeg + Faster-Whisper
- **AI Engine**: OpenAI API (GPT models)
- **Quản lý môi trường**: `uv`

## 📦 Cài đặt

Dự án sử dụng công cụ `uv` để quản lý dependencies nhanh chóng và chính xác.

1.  **Cài đặt uv** (nếu chưa có):
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

2.  **Đồng bộ thư viện**:
    ```bash
    uv sync
    ```

3.  **Cấu hình biến môi trường**:
    Tạo file `.env` tại thư mục gốc với các thông số:
    ```env
    OPENAI_API_KEY=your_api_key_here
    SECRET_KEY=your_secret_key_for_jwt
    ALGORITHM=HS256
    LOG_LEVEL=INFO
    ```

## 🏃 Chạy Server

Sử dụng script tiện ích để khởi chạy backend:

```bash
bash run_be.sh
```
Mặc định server sẽ chạy tại: `http://localhost:8000`

## 📚 Tài liệu API

Sau khi server khởi động, bạn có thể truy cập tài liệu API tương tác (Swagger UI) tại:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

Tại đây, bạn có thể thử nghiệm trực tiếp các endpoint đăng ký, đăng nhập và xử lý video.

## 🧪 Kiểm thử (Testing)

Hệ thống cung cấp các script để kiểm tra nhanh các thành phần:

- **Xác thực**: `uv run python3 src/backend/tests/test_auth.py`
- **Database**: `uv run python3 src/backend/tests/test_db.py`

## 📂 Cấu trúc thư mục

- `src/backend/models/`: Định nghĩa cấu trúc database.
- `src/backend/services/`: Logic xử lý video và AI.
- `src/backend/schemas/`: Pydantic models cho dữ liệu API.
- `src/backend/auth.py`: Xử lý bảo mật và JWT.
- `src/backend/main.py`: Điểm khởi đầu của ứng dụng FastAPI.

---
© 2026 A20 AI Thuc Chien Team.
