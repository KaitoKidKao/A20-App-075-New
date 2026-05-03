# Backend Feature: Video Captioning & AI Analysis

## 1. Tổng quan
Hệ thống Backend cung cấp giải pháp toàn diện để xử lý video bài giảng, từ việc tạo phụ đề tự động (ASR) đến việc phân tích nội dung chuyên sâu bằng AI để hỗ trợ sinh viên học tập hiệu quả hơn.

## 2. Các Công nghệ sử dụng
- **FastAPI**: Framework hiện đại cho hiệu năng cao.
- **Faster-Whisper**: Công nghệ Speech-to-Text chạy trên CPU với độ chính xác cao.
- **FFmpeg**: Công cụ xử lý âm thanh và video đa năng.
- **OpenAI (gpt-5-nano)**: "Bộ não" AI thực hiện tóm tắt, trích xuất timeline và các điểm nhấn.

## 3. Danh sách API Endpoints

### A. Xác thực (Authentication)
- **Đăng ký**: `POST /api/auth/register` (JSON `{"email": "...", "password": "...", "full_name": "...", "role": "..."}`)
- **Đăng nhập**: `POST /api/auth/login` (Form Data `username`, `password`) -> Trả về `access_token`.

### B. Quản lý Video (Yêu cầu JWT Token)
- **Upload Video**: `POST /api/videos/upload` (Multipart form-data)
- **Xử lý qua URL**: `POST /api/videos/process-url` (JSON `{"url": "..."}`)
- **Danh sách video của tôi**: `GET /api/videos/me`
- **Kiểm tra trạng thái**: `GET /api/videos/{video_id}/status`
    - Trạng thái: `queued`, `downloading`, `extracting_audio`, `transcribing`, `ai_processing`, `completed`, `failed`.

### C. Dữ liệu Phụ đề & Phân tích AI (Yêu cầu JWT Token)
- **Lấy Transcript**: `GET /api/videos/{video_id}/transcript`
- **Lấy Tóm tắt chính**: `GET /api/videos/{video_id}/summary` (Trả về danh sách bullet points)
- **Dòng thời gian (Timeline)**: `GET /api/videos/{video_id}/timeline`
- **Điểm nhấn (Highlights)**: `GET /api/videos/{video_id}/highlights`
- **Làm rõ câu hỏi (Questions)**: `GET /api/videos/{video_id}/questions`
- **Tóm tắt khởi đầu (Briefing)**: `GET /api/videos/{video_id}/briefing`

## 4. Cơ chế tối ưu hóa hiệu năng

### Batching (Gộp yêu cầu AI)
Để tiết kiệm chi phí và tăng tốc độ, Backend sử dụng cơ chế Batching:
- Các dữ liệu **Timeline, Highlights, và Questions** được trích xuất trong duy nhất **01 lần gọi** tới OpenAI.
- Kết quả được xử lý và lưu trữ đồng bộ vào Database.

### Persistence & Storage (Lưu trữ bền vững)
- **Database**: Toàn bộ kết quả phân tích AI được lưu trữ trong bảng `lecture_data`.
- **RBAC**: Người dùng chỉ có quyền truy cập vào dữ liệu của các video do mình sở hữu (trừ Admin).

## 5. Quy trình xử lý (Pipeline)
1. **Tiếp nhận & Xác thực**: Kiểm tra JWT Token, lưu thông tin video vào DB với trạng thái `queued`.
2. **Audio Extraction**: Trích xuất âm thanh MP3 bằng FFmpeg.
3. **ASR (Transcription)**: Chạy Faster-Whisper để tạo dữ liệu phụ đề.
4. **AI Processing**:
    - Gọi LLM để tạo tóm tắt chính (`summary`).
    - Gọi gộp LLM (Batching) để tạo `timeline`, `highlights`, và `questions`.
    - Gọi LLM để tạo `briefing`.
5. **Lưu trữ & Hoàn tất**: Lưu toàn bộ kết quả vào DB và cập nhật trạng thái thành `completed`.

## 6. Kiểm tra & Xác minh
Các script kiểm tra hoạt động của hệ thống:
- **Xác thực**: `src/backend/tests/test_auth.py`
- **Database**: `src/backend/tests/test_db.py`

## 7. Cấu hình môi trường (.env)
- `OPENAI_API_KEY`: API Key để sử dụng các tính năng LLM.
- `SECRET_KEY`: Khóa bí mật để ký JWT Token.
- `ALGORITHM`: Thuật toán mã hóa JWT (Mặc định: HS256).
- `LOG_LEVEL`: Mức độ log (mặc định là `INFO`).
