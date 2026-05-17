# Weekly Journal — Week 05

## Mục tiêu tuần
- Tăng độ ổn định cho backend.
- Tối ưu security và performance.
- Hoàn thiện testing infrastructure.
- Chuẩn hóa auth và deployment pipeline.

## Kết quả đã đạt được
- Hoàn thiện RBAC và security:
  - xóa role khỏi UserCreate schema
  - hardcode student role
  - auto-init admin bằng startup event.
- Xây dựng API:
  - GET /me
  - PATCH /me
  - admin user management APIs.
- Setup testing environment:
  - pytest
  - pytest-asyncio
  - SQLite in-memory
  - AsyncMock cho OpenAI service.
- Viết testcases cho:
  - Auth
  - RBAC
  - Video pipeline
  - Mock AI service.
- Tối ưu upload/video streaming:
  - streaming upload
  - HTTP Range
  - giới hạn MAX_UPLOAD_SIZE_MB.
- Chuyển AI service sang AsyncOpenAI để tránh block event loop.
- Tăng cường production security:
  - SECRET_KEY
  - CORS
  - ENVIRONMENT config.
- Fix lint errors và node.js issues.
- Merge và tối ưu FE/BE toàn hệ thống.

## Khó khăn
- Backend còn phụ thuộc nhiều vào main.py.
- Queue/pipeline architecture chưa hoàn chỉnh.
- Avatar handsign vẫn còn lỗi.

## Cách giải quyết
- Bắt đầu tách router/service layer.
- Thiết kế queue_service và pipeline_service.
- Bổ sung CI workflow và migration planning.

## Kế hoạch tuần sau
- Dockerize toàn hệ thống.
- Deploy thử nghiệm lên cloud.
- Chuẩn hóa response APIs.
- Hoàn thiện feature slide và mindmap.