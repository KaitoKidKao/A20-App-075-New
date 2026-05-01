# Phân tích Source Code: Hệ thống Tự động Tạo Phụ đề và Tóm tắt Video (A20-App-075)

## Tổng quan
- **Mục đích:** Dự án này là một hệ thống Backend xử lý video, cho phép người dùng upload video hoặc gửi URL video để tự động tách âm thanh, nhận diện tiếng nói (Transcription) và tạo bản tóm tắt nội dung bằng AI.
- **Ngôn ngữ lập trình:** Python (sử dụng framework FastAPI).
- **Kích thước:** Dự án bao gồm một file API chính và hai service xử lý chuyên biệt (Video và AI).

---

## Phân tích Chi Tiết

### 1. Luồng xử lý chính (`src/backend/main.py`)
Đây là trái tim của hệ thống, nơi tiếp nhận các yêu cầu từ người dùng và điều phối các tác vụ chạy ngầm.

```python
@app.post("/api/videos/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # ... (xác thực định dạng file)
    video_path = await VideoService.save_video(content, filename)
    background_tasks.add_task(run_video_pipeline, video_id, video_path)
```
- **Chức năng:** Sử dụng `FastAPI` để tạo các Endpoint API.
- **Cơ chế đặc biệt:** Sử dụng `BackgroundTasks` để xử lý video ở chế độ nền. Điều này giúp người dùng không phải chờ đợi lâu khi upload; hệ thống sẽ trả về `video_id` ngay lập tức và tiếp tục xử lý video sau đó.
- **Quản lý trạng thái:** Sử dụng một dictionary `processing_status` để theo dõi tiến độ (queued, extracting_audio, transcribing, completed).

### 2. Dịch vụ Xử lý Video (`src/backend/services/video_service.py`)
Khối này chịu trách nhiệm về các thao tác vật lý trên file video.

```python
@classmethod
def extract_audio(cls, video_path: Path) -> Path:
    command = [
        "ffmpeg", "-i", str(video_path),
        "-vn", "-acodec", "libmp3lame",
        "-y", str(audio_path)
    ]
    subprocess.run(command, capture_output=True, check=True)
```
- **Công cụ sử dụng:** 
    - `FFmpeg`: Một công cụ dòng lệnh mạnh mẽ để tách âm thanh từ video.
    - `yt-dlp`: Cho phép tải video từ các nền tảng như YouTube.
- **Logic:** Video sau khi upload hoặc tải về sẽ được trích xuất lấy file âm thanh (.mp3) để phục vụ cho việc nhận diện tiếng nói, giúp tiết kiệm tài nguyên hơn so với việc xử lý cả file video nặng.

### 3. Dịch vụ Trí tuệ Nhân tạo (`src/backend/services/ai_service.py`)
Đây là nơi diễn ra các thao tác "thông minh" nhất của hệ thống.

```python
@classmethod
def transcribe(cls, audio_path: Path, video_id: str) -> dict:
    model = cls.get_whisper_model()
    segments, info = model.transcribe(str(audio_path), beam_size=5)
    # ... (lưu kết quả vào JSON)
```
- **Whisper AI (`faster-whisper`):** Được sử dụng để chuyển đổi âm thanh thành văn bản. Phiên bản `faster-whisper` tối ưu hóa tốc độ xử lý trên CPU.
- **OpenAI GPT:** Sau khi có văn bản (transcript), hệ thống gửi dữ liệu này đến mô hình ngôn ngữ của OpenAI để yêu cầu tóm tắt thành các ý chính (bullet points).
- **Cơ chế Caching:** Hệ thống kiểm tra xem file transcript đã tồn tại chưa trước khi xử lý lại, giúp tránh lãng phí tài nguyên và chi phí API.

---

## Vấn Đề Tiềm Ẩn và Gợi Ý Cải Thiện

- **Quản lý trạng thái:** Hiện tại `processing_status` được lưu trong bộ nhớ tạm (In-memory). Nếu server khởi động lại, toàn bộ thông tin trạng thái của các video đang xử lý sẽ bị mất. 
    - *Gợi ý:* Nên sử dụng database (như SQLite hoặc Redis) để lưu trạng thái bền vững hơn.
- **Hiệu suất xử lý song song:** `ThreadPoolExecutor` đang giới hạn ở `max_workers=2`. Nếu có nhiều người dùng cùng lúc, việc xử lý sẽ bị chậm.
    - *Gợi ý:* Cần cấu hình linh hoạt dựa trên số nhân CPU của máy chủ hoặc sử dụng các hàng đợi tác vụ chuyên nghiệp như Celery.
- **Giới hạn dữ liệu đầu vào:** Bước tóm tắt đang cắt ngắn văn bản ở mức 4000 ký tự (`full_text[:4000]`). Điều này có thể làm mất thông tin quan trọng nếu video quá dài.
    - *Gợi ý:* Sử dụng kỹ thuật "Map-Reduce" (tóm tắt từng phần rồi tổng hợp lại) để xử lý các transcript dài.
- **Bảo mật:** Hệ thống cho phép upload nhiều định dạng video nhưng chưa giới hạn kích thước file.
    - *Gợi ý:* Thêm kiểm tra `Content-Length` để tránh việc người dùng upload file quá dung lượng làm cạn kiệt ổ cứng.

---

## Tóm Tắt
Hệ thống là một minh chứng tốt về việc kết hợp các công nghệ hiện đại:
1. **Xử lý bất đồng bộ (Asynchronous):** Đảm bảo API luôn phản hồi nhanh.
2. **Sử dụng AI chuyên biệt:** Whisper cho âm thanh và GPT cho ngôn ngữ.
3. **Cấu trúc module rõ ràng:** Tách biệt logic API, xử lý video và xử lý AI giúp dễ dàng bảo trì và mở rộng.

Đây là nền tảng vững chắc để xây dựng các ứng dụng hỗ trợ học tập, phân tích nội dung video hoặc tạo phụ đề tự động.

---
*Ghi chú: Đảm bảo máy chủ đã cài đặt FFmpeg và cấu hình đầy đủ OPENAI_API_KEY trong file .env để hệ thống hoạt động hoàn chỉnh.*
