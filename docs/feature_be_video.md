# Backend Feature: Video Captioning & AI Analysis

## 1. Tổng quan
Hệ thống Backend cung cấp giải pháp toàn diện để xử lý video bài giảng, từ việc tạo phụ đề tự động (ASR) đến việc phân tích nội dung chuyên sâu bằng AI để hỗ trợ sinh viên học tập hiệu quả hơn.

## 2. Các Công nghệ sử dụng
- **FastAPI**: Framework hiện đại cho hiệu năng cao.
- **Faster-Whisper**: Công nghệ Speech-to-Text chạy trên CPU với độ chính xác cao.
- **FFmpeg**: Công cụ xử lý âm thanh và video đa năng.
- **OpenAI (GPT-5-nano)**: "Bộ não" AI thực hiện tóm tắt, trích xuất timeline và các điểm nhấn.

## 3. Danh sách API Endpoints

### A. Quản lý & Trạng thái Video
- **Upload Video**: `POST /api/videos/upload` (Multipart form-data)
- **Xử lý qua URL**: `POST /api/videos/process-url` (JSON `{"url": "..."}`)
- **Kiểm tra trạng thái**: `GET /api/videos/{video_id}/status`
    - Trạng thái: `queued`, `downloading`, `extracting_audio`, `transcribing`, `completed`, `failed`.

### B. Dữ liệu Phụ đề & Tóm tắt
- **Lấy Transcript**: `GET /api/videos/{video_id}/transcript`
    - Trả về danh sách các đoạn hội thoại kèm mốc thời gian (start/end).
- **Lấy Tóm tắt chính**: `GET /api/videos/{video_id}/summary`
    - Các ý chính của bài giảng dạng bullet points.

### C. Tính năng AI Nâng cao (Mới)
- **Dòng thời gian (Timeline)**: `GET /api/videos/{video_id}/timeline`
    - Chia nhỏ bài giảng thành các chương (chapters) theo chủ đề một cách thông minh (Smart Hybrid).
- **Điểm nhấn (Highlights)**: `GET /api/videos/{video_id}/highlights`
    - Các khoảnh khắc quan trọng, lời dặn của giảng viên hoặc kiến thức thi cử.
- **Làm rõ câu hỏi (Questions)**: `GET /api/videos/{video_id}/questions`
    - Danh sách câu hỏi trong bài giảng đã được AI viết lại (rephrase) cho mạch lạc.
- **Tóm tắt khởi đầu (Briefing)**: `GET /api/videos/{video_id}/briefing`
    - Mục tiêu bài học và các thuật ngữ then chốt cho sinh viên trước khi xem.

## 4. Cơ chế tối ưu hóa hiệu năng

### Batching (Gộp yêu cầu AI)
Để tiết kiệm chi phí và tăng tốc độ, Backend sử dụng cơ chế Batching:
- Các dữ liệu **Timeline, Highlights, và Questions** được trích xuất trong duy nhất **01 lần gọi** tới OpenAI.
- Kết quả được xử lý và trả về dưới dạng JSON cấu trúc.

### Caching (Lưu trữ đệm)
- Toàn bộ kết quả phân tích AI được lưu trữ tại `data/uploads/ai_results/{video_id}/`.
- Các yêu cầu sau đó cho cùng một video sẽ được phục vụ ngay lập tức từ ổ đĩa mà không cần gọi lại AI.

## 5. Quy trình xử lý (Pipeline)
1. **Tiếp nhận**: Lưu video vào `data/uploads/videos`.
2. **Audio Extraction**: Trích xuất âm thanh MP3 bằng FFmpeg.
3. **ASR (Transcription)**: Chạy Faster-Whisper để tạo file JSON phụ đề.
4. **AI Processing**:
    - Gọi LLM để tạo tóm tắt chính (`summary`).
    - Gọi gộp LLM (Batching) để tạo `timeline`, `highlights`, và `questions`.
    - Gọi LLM để tạo `briefing`.
5. **Hoàn tất**: Cập nhật trạng thái thành `completed`.

## 6. Kiểm tra & Xác minh
Một script kiểm tra nội bộ đã được cung cấp để xác minh các API hoạt động đúng:
- **Vị trí**: `src/backend/tests/verify_ai_features.py`
- **Lệnh chạy**: `python3 src/backend/tests/verify_ai_features.py`

## 7. Cấu hình môi trường (.env)
- `OPENAI_API_KEY`: API Key để sử dụng các tính năng LLM.
- `DEFAULT_MODEL`: Mặc định là `gpt-5-nano`.
- `LOG_LEVEL`: Mức độ log (mặc định là `INFO`).
