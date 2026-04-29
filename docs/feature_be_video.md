# Backend Feature: Video Captioning & Summarization

## 1. Tổng quan
Hệ thống Backend đã được tái cấu trúc để hỗ trợ việc xử lý video bài giảng, tự động tạo phụ đề (offline) và tóm tắt nội dung bằng AI.

## 2. Các Công nghệ sử dụng
- **FastAPI**: Framework chính cho API.
- **Faster-Whisper**: Chuyển đổi giọng nói thành văn bản (Speech-to-Text) chạy trên CPU.
- **FFmpeg**: Tách âm thanh từ video.
- **yt-dlp**: Tải video từ các URL (YouTube, Direct links, ...).
- **OpenAI (GPT-5-nano)**: Tóm tắt nội dung transcript thành bullet points.

## 3. Danh sách API Endpoints

### A. Quản lý Video
- **Upload Video**: `POST /api/videos/upload` (Multipart form-data)
- **Xử lý qua URL**: `POST /api/videos/process-url` (JSON `{"url": "..."}`)
- **Kiểm tra trạng thái**: `GET /api/videos/{video_id}/status`
    - Trạng thái: `queued`, `downloading`, `extracting_audio`, `transcribing`, `completed`, `failed`.

### B. Dữ liệu đầu ra
- **Lấy Transcript**: `GET /api/videos/{video_id}/transcript`
    - Trả về JSON: `{"segments": [{"start": float, "end": float, "text": str}, ...]}`.
- **Lấy Tóm tắt**: `GET /api/videos/{video_id}/summary`
    - Trả về JSON: `{"summary": ["Point 1", "Point 2", ...]}`.

## 4. Quy trình xử lý (Pipeline)
1. **Tiếp nhận**: Lưu file upload hoặc tải từ URL về thư mục `data/uploads/videos`.
2. **Tách âm thanh**: Dùng FFmpeg trích xuất file MP3 vào `data/uploads/audio`.
3. **Nhận diện (ASR)**: Dùng Whisper model `small` chạy trên CPU để tạo phụ đề.
4. **Lưu trữ**: Transcript được lưu dạng JSON trong `data/uploads/transcripts`.
5. **Tóm tắt**: Khi có transcript, gọi LLM để trích xuất các ý chính.

## 5. Cấu hình môi trường (.env)
- `OPENAI_API_KEY`: Dùng cho bước tóm tắt.
- `DEFAULT_MODEL`: Mặc định là `gpt-5-nano`.
- `LOG_LEVEL`: Mức độ log (INFO, DEBUG).
