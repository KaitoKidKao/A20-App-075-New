# Weekly Journal — Week 03

## Mục tiêu tuần
- Hoàn thiện MVP nền tảng.
- Xây dựng hệ thống Authentication & Authorization.
- Kết nối frontend và backend.
- Tích hợp database vào video processing pipeline.

## Kết quả đã đạt được
- Thiết kế database cho Student/Admin bằng SQLite + SQLModel.
- Build Authentication & Authorization:
  - JWT auth
  - bcrypt hash password
  - register/login API
  - role Student/Admin.
- Tích hợp database vào video pipeline:
  - lưu metadata video
  - lưu transcript
  - lưu timeline và summary AI.
- Refactor backend APIs từ in-memory sang database.
- Xây dựng Dashboard và Landing Page theo phong cách “Warm Editorial”.
- Đồng bộ UI/UX theo Rose Theme.
- Triển khai Settings page:
  - accessibility
  - high contrast
  - auto-scroll
  - font size adjustment.
- Kết nối FE với backend Python APIs.
- Triển khai middleware bảo vệ protected routes.
- Tối ưu responsive mobile.

## Khó khăn
- Kiến trúc backend ban đầu còn monolith.
- Mock auth và backend thật chưa đồng bộ hoàn toàn.

## Cách giải quyết
- Refactor API structure.
- Chuyển đổi dần từ mock logic sang real APIs.
- Tối ưu utility system và Next.js image handling.

## Kế hoạch tuần sau
- Research và build các feature AI tương tự NotebookLM.
- Nghiên cứu Avatar HandSign và Text-to-Visual Sign Language.
- Build visualization pipeline.