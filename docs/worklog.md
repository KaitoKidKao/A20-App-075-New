# Worklog

| Ngày | Thành viên | Công việc | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 13/04/2026 | Lê Minh Tuấn | Setup Frontend, UV, AI-Log Hub | Done | Khởi tạo base FE và hệ thống log |
| 13/04/2026 - 15/04/2026 | Nguyễn Trí Cao | Research ASR, TTS | Done | Nghiên cứu pipeline speech-to-text và text-to-speech |
| 13/04/2026 - 15/04/2026 | Đậu Văn Nam | Test PyMuPDF và các hướng parse document | Done | Xử lý tốt file text thuần, tiếp tục research bảng/hình ảnh/công thức |
| 15/04/2026 - 16/04/2026 | Nguyễn Trí Cao | Viết Brief dự án | Done | Hoàn thiện mô tả định hướng ban đầu |
| 15/04/2026 | Đậu Văn Nam | Test edge-tts | Done | Research giải pháp TTS mã nguồn mở |
| 17/04/2026 - 20/04/2026 | Nguyễn Trí Cao | Thu thập dataset PDF/DOCX | Done | Thu thập tài liệu học thuật cho pipeline ingest |
| 17/04/2026 | Đậu Văn Nam | Build core ingest flow | Done | Ingest PDF/DOCX bằng Chandra và đưa qua edge-tts |
| 20/04/2026 - 25/04/2026 | Lê Minh Tuấn | Research và thiết kế UI/UX accessibility | Done | Chuẩn bị implement FE cho sinh viên khiếm thính |
| 20/04/2026 - 25/04/2026 | Nguyễn Trí Cao | Thu thập PDF học thuật, viết User Stories, PRD | Done | Hoàn thiện requirement và persona |
| 21/04/2026 - 24/04/2026 | Đậu Văn Nam | Build backend APIs và merge FE/BE | Done | Tạo API để FE tích hợp |
| 24/04/2026 - 27/04/2026 | Cả team | Demo, nhận feedback mentor, refine persona | Done | Điều chỉnh hướng sản phẩm tập trung sinh viên khiếm thính |
| 27/04/2026 - 28/04/2026 | Đậu Văn Nam | Liệt kê và mở rộng feature accessibility | Done | Xây dựng feature summary cho AI20K |
| 28/04/2026 - 29/04/2026 | Đậu Văn Nam | Refactor codebase với core features mới | Done | Caption, timeline, summary, video learning |
| 28/04/2026 | Lê Minh Tuấn | Thiết kế Figma prototype | Done | Prototype cho hệ thống accessibility |
| 28/04/2026 - 29/04/2026 | Lê Minh Tuấn | Code Frontend theo Figma | Done | Xây dựng UI theo prototype |
| 28/04/2026 | Nguyễn Trí Cao | Viết PRD | Done | Hoàn thiện Product Requirement Document |
| 28/04/2026 - 30/04/2026 | Nguyễn Trí Cao | Research opensource và trực quan hóa | Done | Research infographic, visualization |
| 30/04/2026 | Đậu Văn Nam | Thêm feature AI learning support | Done | Attention Highlighting, Lecture Timeline, Question Rephrase |
| 30/04/2026 - 01/05/2026 | Đậu Văn Nam | Thiết kế Database Auth | Done | Students/Admin schema |
| 30/04/2026 - 02/05/2026 | Lê Minh Tuấn | Xây dựng FE Auth + Dashboard Admin | Done | Responsive Auth UI |
| 01/05/2026 - 02/05/2026 | Đậu Văn Nam | Setup Database SQLite + SQLModel | Done | Setup models và database connection |
| 01/05/2026 - 02/05/2026 | Đậu Văn Nam | Build Authentication & Authorization | Done | JWT auth, bcrypt hash, RBAC |
| 01/05/2026 - 02/05/2026 | Đậu Văn Nam | Tích hợp DB vào Video Pipeline | Done | Lưu transcript, summary, timeline |
| 01/05/2026 - 02/05/2026 | Đậu Văn Nam | Refactor Backend APIs dùng Database | Done | Chuyển từ in-memory sang DB |
| 01/05/2026 - 02/05/2026 | Đậu Văn Nam | Optimize & cleanup hệ thống | Done | Tối ưu query và cleanup JSON |
| 01/05/2026 - 03/05/2026 | Nguyễn Trí Cao | Research Avatar HandSign | Done | Nghiên cứu text-to-sign |
| 04/05/2026 - 06/05/2026 | Nguyễn Trí Cao | Flashcards & Visualization Docs | Done | Research tài liệu trực quan |
| 04/05/2026 - 06/05/2026 | Nguyễn Trí Cao | Infographic Generation | Done | Research AntV infographic |
| 04/05/2026 - 06/05/2026 | Đậu Văn Nam | Mindmap Generation | Done | Sinh sơ đồ tư duy tự động |
| 04/05/2026 - 06/05/2026 | Đậu Văn Nam | Quiz/Test Generation | Done | Sinh câu hỏi tự động |
| 04/05/2026 - 06/05/2026 | Đậu Văn Nam | Slide Generation | Done | Tích hợp RevealJS |
| 07/05/2026 - 09/05/2026 | Lê Minh Tuấn | Enhanced Student Dashboard | Done | Dashboard học tập accessibility |
| 07/05/2026 - 09/05/2026 | Lê Minh Tuấn | UI Polish & Theme Consistency | Done | Đồng bộ UI/UX hệ thống |
| 08/05/2026 - 10/05/2026 | Đậu Văn Nam | CRUD Profile Student | Done | API profile học sinh |
| 08/05/2026 - 10/05/2026 | Đậu Văn Nam | Fix LOGIN ROLE flow | Done | Chỉ cho phép Student login |
| 09/05/2026 | Nguyễn Trí Cao | Fix JWT integration FE/BE | Done | Thay mock auth bằng auth thật |
| 09/05/2026 | Nguyễn Trí Cao | Fix signup password flow | Done | Đồng bộ logic FE/BE |
| 09/05/2026 | Đậu Văn Nam | Ngăn leo thang đặc quyền | Done | Hardcode student role |
| 09/05/2026 | Đậu Văn Nam | Auto-init Admin bằng startup event | Done | Đọc config từ .env |
| 09/05/2026 | Đậu Văn Nam | API Profile & User Management | Done | GET/PATCH /me và API Admin |
| 09/05/2026 | Đậu Văn Nam | Setup môi trường Testing | Done | Pytest + SQLite in-memory |
| 09/05/2026 | Đậu Văn Nam | Viết testcases Auth/RBAC/Videos | Done | Mock AI pipeline |
| 09/05/2026 - 11/05/2026 | Nguyễn Trí Cao | Optimize stream video FE/BE | Done | HTTP Range + stream upload |
| 10/05/2026 - 11/05/2026 | Nguyễn Trí Cao | Security hardening production | Done | SECRET_KEY, CORS, ENV |
| 10/05/2026 - 11/05/2026 | Nguyễn Trí Cao | Refactor AIService async pipeline | Done | AsyncOpenAI, tránh block |
| 11/05/2026 - 12/05/2026 | Nguyễn Trí Cao | Fix lint & Node.js issues | Done | Cleanup codebase |
| 12/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Deploy Railway | Done | Chuẩn bị deployment |
| 13/05/2026 - 15/05/2026 | Nguyễn Trí Cao | Fix Avatar HandSign bug | Doing | Tiếp tục xử lý handsign |
| 13/05/2026 - 15/05/2026 | Nguyễn Trí Cao, Đậu Văn Nam | Thiết kế lại hệ thống data | Doing | Refactor architecture |
| 13/05/2026 - 15/05/2026 | Lê Minh Tuấn | Admin UI/UX & Bottom Bar | Doing | Tối ưu trải nghiệm admin |
| 13/05/2026 - 15/05/2026 | Đậu Văn Nam | Build Docker Backend | Done | Dockerize FastAPI backend |
| 13/05/2026 - 15/05/2026 | Lê Minh Tuấn | Build Docker Frontend | Done | Dockerize Next.js frontend |
| 13/05/2026 - 15/05/2026 | Đậu Văn Nam | Test core features hệ thống | Done | Kiểm tra pipeline chính |
| 13/05/2026 - 15/05/2026 | Lê Minh Tuấn | Deploy VM/AWS/Railway/Vercel | Doing | Deploy infrastructure |
| 14/05/2026 | Nguyễn Trí Cao | Caption song ngữ & subtitle transition | Done | Cải thiện accessibility subtitle |
| 13/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Refactor backend router/service | Doing | Giảm monolith main.py |
| 13/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Chuẩn hóa auth cookie/JWT | Doing | Đồng bộ FE/BE |
| 13/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Chuẩn hóa response APIs | Doing | upload/process/status |
| 13/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Build queue service & pipeline service | Doing | Redis/RQ + fallback |
| 13/05/2026 - 14/05/2026 | Nguyễn Trí Cao | Setup Alembic & CI workflow | Doing | Migration + CI |
| 14/05/2026 - 15/05/2026 | Đậu Văn Nam | Merge code nhánh dev | Done | Resolve merge conflicts |
| 14/05/2026 - 15/05/2026 | Đậu Văn Nam | Refactor feature Slide backend | Done | Tối ưu pipeline slide |
| 14/05/2026 - 15/05/2026 | Đậu Văn Nam | Refactor feature Mindmap backend | Done | Cải thiện output mindmap |
| 15/05/2026 - 16/05/2026 | Đậu Văn Nam | Build và deploy AWS Cloud | Done | Deploy thử nghiệm production |
| 15/05/2026 - 16/05/2026 | Cả team | Kiểm tra output deploy vs local | Doing | Đảm bảo consistency |
| 16/05/2026 | Đậu Văn Nam | Hoàn thiện feature Slide & Mindmap | Done | Merge vào nhánh develop |
| 16/05/2026 | Đậu Văn Nam | Viết docs & chuẩn bị nộp bài | Done | README, Architecture, Worklog |
| 17/05/2026 | Cả team | Final review & submission | Done | Kiểm tra source code và deploy cuối |