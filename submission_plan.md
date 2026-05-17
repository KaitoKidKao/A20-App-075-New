# 📋 Kế Hoạch Phân Công — Nộp Bài AI20K (Deadline: 23:59 ngày 17/05)

> [!CAUTION]
> **Deadline còn khoảng 13 tiếng.** Kế hoạch này ưu tiên theo thứ tự quan trọng nhất → ít quan trọng nhất. Nếu hết thời gian, bỏ các mục ở cuối.

---

## 📊 Đánh Giá Hiện Trạng

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Source Code (FE + BE) | ✅ Có | Đã push develop mới nhất |
| Live URL | ✅ Đã deploy | Đã chạy ổn định |
| README.md | ⚠️ Thiếu nhiều | Chỉ có hướng dẫn kỹ thuật, thiếu Quick Links, mô tả dự án, tính năng, team... |
| Architecture Diagram | ❌ Chưa có | Cần tạo `docs/architecture.md` |
| AI Logs | ⚠️ Có `.ai-log/session.jsonl` | Cần format thành `docs/ai-logs.md` có case mẫu |
| Worklog | ❌ Chưa có | Cần tạo `docs/worklog.md` |
| Weekly Journal | ❌ Chưa có | Cần tạo `docs/journal/` |
| Evaluation Evidence | ❌ Chưa có | Cần tạo `docs/evaluation-report.md` |
| Video Demo | ❌ Chưa có | Cần quay 3-5 phút |
| Pitch Deck | ❌ Chưa có | Cần làm 5-10 slide |
| `.env.example` | ✅ Có | |
| `docker-compose.yml` | ✅ Có | |
| `.gitignore` | ✅ Có | |

---

## 👥 Phân Công 3 Thành Viên

### Người A — **Video Demo + Dữ liệu demo + Hỗ trợ tổng hợp**
### Người B — **Tài liệu kỹ thuật** (README + Architecture + AI Logs)
### Người C — **Pitch Deck + Journal + Worklog + Evaluation**

---

## 🔴 GIAI ĐOẠN 1 — Ưu tiên tối cao (Hoàn thành trước 15:00)

### Người A: Chuẩn bị dữ liệu demo + Viết kịch bản video

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| A1 | Test Live URL trên trình duyệt ẩn danh — đảm bảo ổn | Xác nhận URL OK | 15 phút |
| A2 | Tạo tài khoản demo (student + admin), ghi lại credentials | Thông tin tài khoản | 10 phút |
| A3 | Upload 2-3 video mẫu lên hệ thống, chờ AI xử lý xong | Có dữ liệu demo thật | 1 tiếng |
| A4 | Tạo slide AI, mindmap, flashcard, quiz trên video mẫu | Đủ data cho tất cả tính năng | 30 phút |
| A5 | Viết kịch bản video demo 3-5 phút (cấu trúc bên dưới) | Script demo | 30 phút |
| A6 | Chụp 8-10 screenshot đẹp các chức năng → `docs/screenshots/` | Ảnh cho Deck + README | 30 phút |

### Người B: README.md mới + Architecture + AI Logs

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| B1 | Viết lại `README.md` hoàn chỉnh (dùng prompt gợi ý bên dưới) | README chuẩn | 1.5 tiếng |
| B2 | Tạo `docs/architecture.md` với Mermaid diagram (dùng prompt bên dưới) | Sơ đồ hệ thống | 1 tiếng |
| B3 | Tạo `docs/ai-logs.md` — format 3-5 case mẫu (dùng prompt bên dưới) | AI Logs đúng format | 1 tiếng |

### Người C: Pitch Deck + Tài liệu quá trình

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| C1 | Tạo Pitch Deck 8-10 slide trên Google Slides (dùng prompt bên dưới) | Link public | 2 tiếng |
| C2 | Tạo `docs/worklog.md` — bảng phân công theo ngày (dùng prompt bên dưới) | File markdown | 45 phút |
| C3 | Tạo `docs/journal/week-01.md` đến `week-03.md` (dùng prompt bên dưới) | 3 file journal | 45 phút |

---

## 🟡 GIAI ĐOẠN 2 — Quan trọng (Hoàn thành trước 19:00)

### Người A: Quay & Upload Video Demo

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| A7 | Quay video demo trên Live URL (theo kịch bản A5) | File video | 1 tiếng |
| A8 | Upload video lên YouTube (Unlisted) | Link YouTube | 15 phút |
| A9 | Test link video bằng trình duyệt ẩn danh | Link xem được | 5 phút |

### Người B: Evaluation Report

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| B4 | Tạo `docs/evaluation-report.md` (dùng prompt bên dưới) | Báo cáo đánh giá | 1 tiếng |
| B5 | Tạo `docs/test-cases.md` — 8-10 test case (dùng prompt bên dưới) | Test cases | 30 phút |

### Người C: Hoàn thiện Pitch Deck

| STT | Việc cần làm | Output | Thời gian |
|---|---|---|---|
| C4 | Chèn screenshot sản phẩm vào Pitch Deck (từ ảnh A6) | Slide có hình thật | 30 phút |
| C5 | Chèn Architecture diagram vào Pitch Deck (từ B2) | Slide kiến trúc | 15 phút |
| C6 | Mở quyền public cho Pitch Deck | "Anyone with the link can view" | 5 phút |

---

## 🟢 GIAI ĐOẠN 3 — Tổng hợp & Nộp bài (Trước 22:00)

> [!IMPORTANT]
> **Cả 3 người cùng review.** Không ai nộp 1 mình.

| STT | Người | Việc cần làm | Thời gian |
|---|---|---|---|
| 1 | B | Cập nhật Quick Links ở đầu README với tất cả link thật | 15 phút |
| 2 | B | `git add . && git commit && git push` bản cuối cùng | 5 phút |
| 3 | A | Kiểm tra Live URL lần cuối (trình duyệt ẩn danh) | 10 phút |
| 4 | C | Kiểm tra tất cả link Google Slides / YouTube (trình duyệt ẩn danh) | 10 phút |
| 5 | A | Điền Form nộp bài | 15 phút |
| 6 | Cả 3 | Review lại Form trước khi bấm Submit | 10 phút |

---

## 🎬 Kịch Bản Video Demo (Người A)

| Thời lượng | Nội dung | Ghi chú |
|---|---|---|
| 0:00–0:30 | Giới thiệu tên dự án, team, vấn đề cần giải quyết | Nói ngắn gọn |
| 0:30–1:00 | Mô tả đối tượng sử dụng, use case chính | |
| 1:00–2:30 | Demo trực tiếp trên Live URL: Upload video → Xem phụ đề → AI Mindmap → Tạo Slide → Quiz | Đây là phần quan trọng nhất |
| 2:30–3:30 | Giải thích AI Agent xử lý: Whisper transcription → GPT-4 analysis → Sinh nội dung | |
| 3:30–4:30 | Kết quả, điểm nổi bật, evaluation | |
| 4:30–5:00 | Kết luận, hạn chế và hướng phát triển | |

---

## 🤖 Prompt Gợi Ý Cho Từng Tài Liệu

> [!TIP]
> Copy prompt bên dưới, paste vào ChatGPT / Claude / Gemini, rồi chỉnh sửa output cho phù hợp với dự án thực tế. **Nhớ review và sửa lại trước khi commit — không dùng nguyên kết quả AI.**

---

### 📝 Prompt cho README.md (Người B – task B1)

```
Bạn là technical writer. Hãy viết README.md cho dự án nộp bài cuộc thi AI.

Thông tin dự án:
- Tên: EduSign — Nền tảng Học tập AI cho Sinh viên Khiếm Thính
- Tech stack: Next.js 14 (FE), FastAPI + Python 3.12 (BE), PostgreSQL, Redis + RQ, OpenAI GPT-4, Whisper
- Tính năng chính:
  + Upload video bài giảng, tự động tách audio, transcribe bằng Whisper
  + Phụ đề đa ngôn ngữ, đồng bộ với video player
  + AI phân tích nội dung: sinh sơ đồ tư duy, cấu trúc thời gian, điểm nhấn bài giảng
  + Tạo slide PPTX tự động bằng AI (10 mẫu template), lưu lịch sử và cho tải về
  + Tạo flashcard và quiz tự động từ nội dung video
  + Avatar ngôn ngữ ký hiệu (VSL) cho sinh viên khiếm thính
  + Dashboard quản lý khóa học cho Admin
  + Hệ thống đánh giá và tiến độ học tập
- Deploy: Docker Compose (PostgreSQL + Redis + Backend + Frontend + Worker)
- Live URL: [ĐIỀN VÀO]
- Nhóm 3 người: [ĐIỀN TÊN + VAI TRÒ]

Yêu cầu README:
1. Bắt đầu bằng bảng "Quick Links" (Live URL, Demo Video, Pitch Deck, Architecture, AI Logs, Worklog, Evaluation)
2. Có các section: Giới thiệu, Vấn đề, Giải pháp, Tính năng chính, Kiến trúc, Công nghệ, Cài đặt & Chạy, Team, Hạn chế & Hướng phát triển
3. Viết bằng tiếng Việt, giọng chuyên nghiệp nhưng dễ hiểu
4. Phần "Cài đặt & Chạy" bao gồm cả docker compose
5. Có bảng công nghệ dạng table markdown
```

---

### 🏗️ Prompt cho Architecture (Người B – task B2)

```
Bạn là system architect. Hãy viết file docs/architecture.md cho dự án LMS (Learning Management System) với AI.

Hệ thống gồm các thành phần:
- Frontend: Next.js 14, giao tiếp với Backend qua REST API
- Backend: FastAPI (Python), xử lý auth (JWT), CRUD khóa học/bài học, điều phối AI pipeline
- Database: PostgreSQL (prod) / SQLite (dev)
- Queue: Redis + RQ Worker — nhận job từ Backend, chạy AI pipeline bất đồng bộ
- AI Pipeline:
  1. Upload video → tách audio (ffmpeg)
  2. Transcription bằng OpenAI Whisper
  3. GPT-4 phân tích transcript → sinh: briefing, timeline, highlights, mindmap, flashcards, quiz
  4. Slide Generator: đọc template PPTX + nội dung AI → sinh file PPTX
- File Storage: local filesystem (video, audio, PPTX output)
- External Services: OpenAI API (Whisper + GPT-4)

Yêu cầu:
1. Vẽ sơ đồ tổng quan bằng Mermaid (graph TB), có subgraph cho Frontend, Backend, AI Pipeline, Data Layer
2. Mô tả luồng dữ liệu chính: User upload video → Transcribe → AI Analysis → Hiển thị kết quả
3. Mô tả luồng phụ: User tạo slide → chọn template → AI sinh PPTX → tải về
4. Liệt kê API chính (5-8 endpoint quan trọng nhất)
5. Mô tả database schema chính (5-7 bảng quan trọng nhất, dạng table markdown)
6. Viết bằng tiếng Việt
```

---

### 🤖 Prompt cho AI Logs (Người B – task B3)

```
Bạn là AI engineer. Hãy viết file docs/ai-logs.md cho dự án LMS có tích hợp AI.

Dự án sử dụng AI ở các vị trí sau:
1. Whisper API: transcribe audio → text (có timestamp)
2. GPT-4: phân tích transcript để sinh:
   - Briefing (mục tiêu bài giảng + key terms)
   - Timeline (cấu trúc thời gian)
   - Highlights (điểm nhấn quan trọng)
   - Mindmap (sơ đồ tư duy dạng cây)
   - Flashcards
   - Quiz (multiple choice)
3. GPT-4: sinh nội dung slide PPTX từ transcript

Hãy viết 5 case mẫu theo format:
- Case tiêu đề
- User Input (mô tả input)
- Prompt / System Instruction (prompt thật hoặc mô tả prompt)
- Agent Output (output mẫu)
- Expected Output
- Evaluation (Correctness, Relevance, Latency, Notes)

Bao gồm:
- 3 case thành công (transcription, mindmap generation, slide generation)
- 2 case thất bại hoặc edge case (video quá ngắn, nội dung không rõ ràng)
- Viết bằng tiếng Việt, có nhận xét và cách cải thiện
```

---

### 📊 Prompt cho Pitch Deck (Người C – task C1)

```
Bạn là startup consultant. Hãy viết NỘI DUNG cho Pitch Deck 10 slide, tôi sẽ copy vào Google Slides.

Dự án: EduSign — Nền tảng Học tập AI cho Sinh viên Khiếm Thính
- Vấn đề: Sinh viên khiếm thính gặp khó khăn tiếp cận video bài giảng — thiếu phụ đề, không có hỗ trợ ngôn ngữ ký hiệu, nội dung không được tóm tắt
- Giải pháp: Nền tảng tự động phân tích video, tạo phụ đề, sinh nội dung học tập bằng AI, hỗ trợ avatar ngôn ngữ ký hiệu
- Tech: Next.js, FastAPI, PostgreSQL, OpenAI GPT-4 + Whisper, Docker
- Tính năng: Upload video, phụ đề tự động, AI mindmap, AI slide, flashcard, quiz, avatar VSL
- Nhóm 3 người

Cho tôi 10 slide, mỗi slide gồm:
- Tiêu đề slide
- Bullet points chính (3-5 dòng, ngắn gọn)
- Gợi ý hình ảnh/screenshot nên chèn

Yêu cầu:
- Giọng thuyết trình, chuyên nghiệp, không quá nhiều chữ
- Slide 1: Trang bìa
- Slide 2-3: Vấn đề + Đối tượng
- Slide 4-5: Giải pháp + Demo
- Slide 6-7: Kiến trúc + AI Flow
- Slide 8: Kết quả
- Slide 9: Hạn chế & Kế hoạch
- Slide 10: Cảm ơn + Quick Links
```

---

### 📋 Prompt cho Worklog (Người C – task C2)

```
Bạn là project manager. Hãy viết file docs/worklog.md cho dự án nhóm 3 người, kéo dài 5 tuần (14/04 → 17/05).

Thông tin team:
- Người A: [TÊN] — phụ trách Frontend, UI/UX
- Người B: [TÊN] — phụ trách Backend, Database, API
- Người C: [TÊN] — phụ trách AI Pipeline, Deployment

Các milestone chính:
- Tuần 1 (14/04): Setup project, thiết kế database, khởi tạo FE/BE
- Tuần 2 (21/04): CRUD khóa học, upload video, auth
- Tuần 3 (28/04): AI pipeline (Whisper + GPT-4), phụ đề
- Tuần 4 (05/05): Tính năng nâng cao (mindmap, slide, quiz, flashcard, avatar VSL)
- Tuần 5 (12/05): Deploy, test, fix bug, chuẩn bị nộp bài

Viết dạng bảng markdown:
| Ngày | Thành viên | Công việc | Trạng thái | Ghi chú |

Mỗi tuần khoảng 5-8 dòng, tổng khoảng 30-40 dòng.
Trạng thái dùng: Todo, Doing, Done, Blocked.
```

---

### 📓 Prompt cho Weekly Journal (Người C – task C3)

```
Bạn là project manager. Hãy viết 3 file weekly journal (week-01.md, week-02.md, week-03.md) cho dự án nhóm 3 người.

Dự án: Nền tảng học tập AI cho sinh viên khiếm thính
Thời gian: 5 tuần (14/04 → 17/05), nhưng chỉ cần viết 3 tuần đầu

Mỗi file journal có format:
# Weekly Journal — Week XX
## Mục tiêu tuần
## Kết quả đã đạt được
## Khó khăn
## Cách giải quyết
## Kế hoạch tuần sau

Tuần 1: Setup, thiết kế DB, khởi tạo FE/BE
Tuần 2: Auth, CRUD khóa học, upload video
Tuần 3: AI pipeline, phụ đề, bắt đầu mindmap

Viết ngắn gọn, mỗi section 3-5 bullet points, bằng tiếng Việt.
```

---

### 📈 Prompt cho Evaluation Report (Người B – task B4)

```
Bạn là QA engineer. Hãy viết file docs/evaluation-report.md cho dự án LMS có AI.

Dự án có các chức năng cần đánh giá:
1. Upload video + Transcription (Whisper)
2. AI sinh nội dung (briefing, timeline, mindmap, flashcard, quiz)
3. AI tạo slide PPTX
4. Phụ đề đồng bộ video
5. CRUD khóa học, đăng ký, tiến độ
6. Auth (đăng ký, đăng nhập, phân quyền)

Viết theo format:
## 1. Mục tiêu đánh giá
## 2. Phạm vi đánh giá
## 3. Bộ test case (bảng: ID, Tình huống, Input, Expected, Actual, Kết quả)
## 4. Metrics (bảng: Metric, Giá trị, Cách đo)
## 5. Kết quả chính
## 6. Failure Cases (mô tả lỗi + nguyên nhân + cách xử lý)
## 7. Nhận xét cuối

Viết 8-10 test case. Metrics gồm: thời gian transcribe, độ chính xác AI, thời gian tạo slide, response time API.
Bao gồm 2-3 failure case thật (ví dụ: video quá dài, mạng chậm timeout, AI hallucination).
Viết bằng tiếng Việt, giọng khách quan.
```

---

### 🧪 Prompt cho Test Cases (Người B – task B5)

```
Bạn là QA tester. Hãy viết file docs/test-cases.md cho dự án LMS.

Viết 10 test case dạng bảng markdown:
| ID | Chức năng | Tình huống | Bước thực hiện | Expected | Actual | Pass/Fail |

Bao gồm các nhóm:
- Auth: đăng ký, đăng nhập, phân quyền (2 case)
- Video: upload, xem, phụ đề (2 case)
- AI: transcription, mindmap, slide (3 case)
- Khóa học: tạo, đăng ký, tiến độ (2 case)
- Edge case: file không hợp lệ (1 case)

Viết bằng tiếng Việt. Cột "Actual" và "Pass/Fail" điền kết quả thật (giả sử hầu hết pass, 1-2 fail với ghi chú).
```

---

## ⏰ Timeline Tổng Hợp

```
11:15 ─── BẮT ĐẦU ──────────────────────
  │  A: Test URL +       B: README          C: Pitch Deck
  │     Dữ liệu demo       Architecture       Worklog
  │     Screenshots         AI Logs            Journal
  │
15:00 ─── CHECKPOINT 1 ─────────────────
  │  ✓ URL OK, data OK  ✓ README done      ✓ Deck draft
  │  ✓ Screenshots       ✓ Architecture     ✓ Worklog
  │  ✓ Script video      ✓ AI Logs          ✓ Journal
  │
  │  A: Quay Video       B: Evaluation      C: Polish Deck
  │  A7-A9               B4-B5              C4-C6
  │
19:00 ─── CHECKPOINT 2 ─────────────────
  │  ✓ Video trên YT    ✓ Eval report      ✓ Deck final
  │  ✓ Link public      ✓ Test cases       ✓ Link public
  │
  │  CẢ 3: Tổng hợp + Review + Nộp Form
  │
22:00 ─── NỘP BÀI ──────────────────────
  │  ✓ Form đã điền     ✓ Tất cả link OK
  │
23:59 ─── DEADLINE ──────────────────────
```

---

## ✅ Checklist Cuối Cùng Trước Khi Nộp

- [ ] Live URL chạy ổn trên trình duyệt ẩn danh
- [ ] GitHub repo có code mới nhất
- [ ] README có Quick Links đầy đủ ở trên cùng
- [ ] Video demo xem được (trình duyệt ẩn danh)
- [ ] Pitch Deck mở được (trình duyệt ẩn danh)
- [ ] Architecture diagram có trong repo
- [ ] AI Logs có trong repo
- [ ] Worklog + Journal có trong repo
- [ ] Evaluation report + screenshots có trong repo
- [ ] `.env` KHÔNG bị commit
- [ ] Form nộp bài đã điền đúng link
- [ ] Nộp trước 23:59 ngày 17/05
