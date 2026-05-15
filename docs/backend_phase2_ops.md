# Ghi chú vận hành backend và caption song ngữ

## 1. Cấu hình cơ sở dữ liệu

Trong môi trường production, đặt `DATABASE_URL` trỏ tới PostgreSQL:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/a20
```

SQLite chỉ nên dùng cho local/demo. Sau khi đổi database, chạy migration:

```bash
python -m alembic upgrade head
```

## 2. Chạy hàng đợi xử lý video

Đặt Redis trong `.env`:

```env
REDIS_URL=redis://localhost:6379/0
```

Chạy API và worker ở hai terminal khác nhau:

```bash
uvicorn src.backend.main:app --reload
python -m src.backend.scripts.run_worker
```

Khi Redis không sẵn sàng, backend sẽ fallback sang `BackgroundTasks`. Fallback phù hợp local, nhưng production nên dùng Redis/RQ worker để tránh mất job khi server restart.

## 3. Trạng thái pipeline

Pipeline lưu trạng thái trong bảng `processing_jobs` và đồng bộ sang `lessons.status`.

Các trạng thái đang dùng:

- `queued`
- `downloading`
- `extracting_audio`
- `transcribing`
- `translating`
- `ai_processing`
- `completed`
- `failed`
- `failed_restart`

Các trường `attempts`, `error_message`, `last_failed_at` dùng để debug và theo dõi retry.

## 4. Reprocess video đã upload

Khi video đã upload nhưng caption hoặc artifact AI lỗi, gọi:

```http
POST /api/videos/{video_id}/reprocess
```

Endpoint sẽ kiểm tra quyền truy cập, tìm file video cũ, reset job về `queued`, rồi đưa lại vào hàng đợi xử lý.

## 5. Quy ước caption song ngữ Phase 2

Whisper là nguồn xác định ngôn ngữ gốc. Backend chuẩn hóa ngôn ngữ thành:

- `vi`: video gốc tiếng Việt
- `en`: video gốc tiếng Anh hoặc ngôn ngữ chưa hỗ trợ khác

Transcript trả về từ `GET /api/videos/{video_id}/transcript` có cấu trúc chính:

```json
{
  "source_language": "en",
  "target_language": "vi",
  "available_languages": ["vi", "en"],
  "translation_status": {
    "vi": {
      "status": "completed",
      "error": null
    }
  },
  "segments_by_language": {
    "en": [
      { "index": 0, "start": 0.0, "end": 3.2, "text": "Original caption" }
    ],
    "vi": [
      { "index": 0, "start": 0.0, "end": 3.2, "text": "Phụ đề đã dịch" }
    ]
  }
}
```

Nguyên tắc bắt buộc:

- Không overwrite transcript gốc.
- Bản dịch phải giữ nguyên `index`, `start`, `end`.
- Nếu dịch lỗi, backend chỉ trả caption gốc và đánh dấu `translation_status[target].status = translation_failed`.
- Frontend chỉ bật nút `VI` hoặc `EN` khi ngôn ngữ đó có dữ liệu thật trong `segments_by_language`.
- Không fallback bằng cách lọc regex hoặc trộn dữ liệu từ `segments`.

## 6. Kiểm thử nhanh

Chạy test backend:

```bash
python -m pytest -q src/backend/tests
```

Nhóm test Phase 2 nằm ở:

- `src/backend/tests/test_bilingual_transcript.py`

Các test này kiểm tra:

- Video tiếng Anh tạo đủ `en` và `vi`.
- Video tiếng Việt tạo đủ `vi` và `en`.
- Timeline `start/end` của hai bản khớp nhau.
- Khi dịch lỗi, hệ thống không trộn dữ liệu và vẫn hiển thị caption gốc.
