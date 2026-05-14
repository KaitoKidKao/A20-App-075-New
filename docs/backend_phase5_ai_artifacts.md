# Phase 5 - Nội dung học tập và AI artifacts

## Mục tiêu

Phase 5 biến video đã xử lý thành một bài học có giá trị, không chỉ dừng ở phụ đề. Trọng tâm là chuẩn hóa output AI, theo dõi trạng thái từng artifact và đảm bảo một artifact lỗi không làm hỏng toàn bộ bài học.

## Những phần đã triển khai

### 1. Chuẩn hóa artifact

Đã thêm service:

- `src/backend/services/artifact_service.py`

Service này chuẩn hóa các artifact chính:

- `summary`
- `timeline`
- `highlights`
- `questions`
- `briefing`
- `flashcards`
- `quizzes`
- `visual_data`
- `handsign_data`

Mỗi artifact được ép về schema tối thiểu trước khi lưu vào `content_metadata.ai_analysis`.

### 2. Trạng thái riêng cho từng artifact

Trong `ai_analysis` có thêm trường:

```json
{
  "artifact_status": {
    "summary": { "status": "ready", "error": null },
    "timeline": { "status": "failed", "error": "metadata timeout" },
    "flashcards": { "status": "empty", "error": null }
  }
}
```

Các trạng thái hiện dùng:

- `ready`: artifact có dữ liệu dùng được.
- `empty`: artifact không lỗi nhưng không có dữ liệu.
- `failed`: artifact sinh lỗi.

### 3. Artifact lỗi không làm hỏng pipeline

Pipeline giờ chạy từng nhóm artifact qua wrapper riêng. Nếu một nhóm lỗi, ví dụ timeline lỗi, các nhóm khác như summary, flashcards, quizzes vẫn được lưu nếu sinh thành công.

Điều này áp dụng cho:

- summary
- metadata: timeline, highlights, questions
- briefing
- notebook data: flashcards, visual data
- handsign data
- quizzes

### 4. Endpoint kiểm tra trạng thái artifact

Đã thêm:

```http
GET /api/videos/{video_id}/artifacts/status
```

Response:

```json
{
  "video_id": "uuid",
  "artifact_status": {
    "summary": { "status": "ready", "error": null },
    "timeline": { "status": "ready", "error": null }
  }
}
```

Frontend có thể dùng endpoint này để hiển thị phần nào đã sẵn sàng, phần nào đang thiếu hoặc lỗi.

### 5. Frontend API client

Đã thêm:

- `api.videos.getArtifactStatus(videoId)`

File:

- `src/frontend/lib/api.ts`

### 6. Test

Đã thêm:

- `src/backend/tests/test_artifact_service.py`

Các test kiểm tra:

- Artifact được normalize đúng schema.
- Artifact có dữ liệu được đánh dấu `ready`.
- Artifact lỗi được đánh dấu `failed`.
- Artifact khác vẫn giữ dữ liệu khi một artifact lỗi.

## Quy ước lưu dữ liệu

AI analysis sau Phase 5 có dạng:

```json
{
  "transcript": {},
  "summary": [],
  "timeline": [],
  "highlights": [],
  "questions": [],
  "briefing": {},
  "visual_data": {},
  "cover_image_url": null,
  "handsign_data": [],
  "flashcards": [],
  "quizzes": [],
  "artifact_status": {}
}
```

## Việc còn nên làm tiếp

- Thêm màn hình review nội dung cho teacher/admin.
- Cho phép sửa transcript, flashcard, quiz trước khi publish.
- Thêm cờ `published/draft` cho lesson hoặc artifact.
- Lưu lịch sử chỉnh sửa artifact.
- Thêm retry riêng cho artifact lỗi mà không cần reprocess toàn bộ video.
