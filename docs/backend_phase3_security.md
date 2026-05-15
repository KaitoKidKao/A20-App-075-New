# Phase 3 - Bảo mật và Auth production

## Những điểm đã triển khai

### 1. Cookie auth an toàn hơn

Backend tiếp tục dùng cookie `HttpOnly` cho access token:

- `AUTH_COOKIE_NAME=access_token`
- `AUTH_COOKIE_SECURE=true` nên bật ở production HTTPS
- `AUTH_COOKIE_SAMESITE=lax` mặc định cho local

Frontend store không còn lưu token nhạy cảm vào localStorage. Token trả về từ API login hiện vẫn giữ để tương thích ngược, nhưng frontend không dùng giá trị này làm nguồn xác thực.

### 2. Chuẩn hóa role

Role hợp lệ:

- `student`
- `teacher`
- `admin`

API register sẽ normalize role về chữ thường và từ chối role ngoài danh sách trên.

### 3. Kiểm tra quyền truy cập video/lesson

`check_video_access` hiện kiểm tra theo thứ tự:

- Admin được truy cập.
- Teacher/instructor được truy cập lesson thuộc course mình dạy.
- Student được truy cập lesson nếu có enrollment `active` trong course.
- Các trường hợp còn lại trả `403 Access denied`.

Endpoint `/api/videos/{video_id}/status` đã dùng access check, tránh lộ trạng thái video của người khác.

### 4. Rate limit cơ bản

Đã thêm rate limit in-memory cho:

- Login: `LOGIN_RATE_LIMIT=10/minute`
- Upload/process URL: `UPLOAD_RATE_LIMIT=20/hour`
- Generate avatar: `AVATAR_RATE_LIMIT=10/hour`

Lưu ý: rate limit in-memory phù hợp local hoặc single-instance. Khi deploy nhiều instance, nên thay bằng Redis-based rate limiter.

### 5. Validate upload

Upload video kiểm tra:

- Extension trong `ALLOWED_VIDEO_EXTENSIONS`
- MIME type trong `ALLOWED_VIDEO_MIME_TYPES`
- Kích thước theo `MAX_UPLOAD_SIZE_MB`
- Thời lượng qua `ffprobe` nếu máy có cài FFmpeg/ffprobe

Nếu `ffprobe` chưa được cài, backend sẽ bỏ qua validate duration và ghi warning log.

## Biến môi trường cần có

```env
SECRET_KEY=replace-with-a-strong-secret
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=lax
LOGIN_RATE_LIMIT=10/minute
UPLOAD_RATE_LIMIT=20/hour
AVATAR_RATE_LIMIT=10/hour
MAX_UPLOAD_SIZE_MB=500
MAX_VIDEO_DURATION_SECONDS=14400
ALLOWED_VIDEO_EXTENSIONS=.mp4,.mov,.avi,.mkv
ALLOWED_VIDEO_MIME_TYPES=video/mp4,video/quicktime,video/x-msvideo,video/x-matroska
```

Production nên đặt:

```env
ENVIRONMENT=production
AUTH_COOKIE_SECURE=true
CORS_ALLOW_ORIGINS=https://your-domain.com
```

## Test bảo mật đã thêm

File:

- `src/backend/tests/test_security_api.py`

Các tình huống được kiểm tra:

- User không enroll course không xem được trạng thái lesson.
- User đã enroll xem được lesson.
- Upload MIME không hợp lệ bị chặn sớm.

Chạy:

```bash
python -m pytest -q src/backend/tests
```

## Việc còn nên làm ở Phase 3 nâng cao

- Đưa rate limit sang Redis để dùng được khi scale nhiều backend instance.
- Thêm refresh token hoặc session rotation nếu cần phiên đăng nhập dài.
- Thêm scan virus/malware cho file upload nếu public internet.
- Ẩn hoặc bỏ hẳn `access_token` khỏi JSON response login khi frontend đã hoàn toàn chuyển sang cookie-only.
- Bổ sung audit log cho login fail, upload fail, generate avatar fail.
