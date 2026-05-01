

**AI20K-200  ·  PRODUCT SURVIVAL ROADMAP**

**UNIVERSAL DESIGN FOR LEARNING**

Kế hoạch 5 tuần · 3 thành viên · Audio-First Accessibility Agent

**Mục tiêu cuối kỳ:**  Sản phẩm chạy online, demo live được, có URL thật, có ít nhất 5 user test thật.

**North Star Metric:**  Time-to-Access < 10 phút (baseline hiện tại: 1–3 ngày).

**Survival Hypothesis:**  SV khiếm thị, giảng viên, đội ngũ hỗ trợ sẽ chủ động upload tài liệu nếu có audio có cấu trúc — thay vì chờ trợ năng.

**Team:**  3 thành viên — mỗi tuần sprint rõ ràng, demo được thứ gì đó.

# **Mục lục**

I.    Tổng quan lộ trình 5 tuần

II.   Phân công vai trò

III.  Tuần 1 — Briefing, Research & Setup (Bước 1 + Thiết lập nền)

IV.   Tuần 2 — PRD, Data & AI Pipeline Sprint 1 (Bước 2 + 3 + 5-S1)

V.    Tuần 3 — Web UI + AI Integration Sprint 2 (Bước 4 + 5-S2)

VI.   Tuần 4 — Polish, Deploy & User Testing (Bước 5-S3/S4 + 6)

VII.  Tuần 5 — Stabilize, Demo Prep & Final (Bước 7)

VIII. Quy tắc làm việc nhóm

IX.   Checklist nộp bài cuối kỳ

# **I. Tổng quan lộ trình 5 tuần**

Mỗi tuần tương ứng với một hoặc nhiều bước trong framework. Nguyên tắc: demo được thứ gì đó mỗi tuần — không để tuần nào trắng output.

| Tuần | Tên giai đoạn | Bước (Framework) | Output chính |
| :---- | :---- | :---- | :---- |
| **Tuần 1** | Brief · Research · Setup | Bước 1 + Git + Môi trường | Brief 1 trang, Competitor map, Repo khởi tạo |
| **Tuần 2** | PRD · Data · AI Pipeline | Bước 2 + 3 + Sprint 1 | PRD, Dataset, AI pipeline chạy local được |
| **Tuần 3** | Kiến trúc · Web UI · Tích hợp | Bước 4 + Sprint 2 | System diagram, Web UI + AI kết nối, Auth |
| **Tuần 4** | Polish · Deploy · User Test | Sprint 3/4 + Bước 6 | URL production, 5 user test, Feedback log |
| **Tuần 5** | Final · Demo Prep | Bước 7 | Demo live, GitHub clean, Slide kiến trúc |

# **II. Phân công vai trò**

Phân công theo thế mạnh — không cứng nhắc. Mỗi sprint có thể rotate nếu cần. Quy tắc: ai pick task thì own output đó.

| Vai trò | Tên (điền vào) | Trách nhiệm chính | Công việc thực tế |
| :---- | :---- | :---- | :---- |
| Tech Lead / AI | ________Nam_________ | AI pipeline, Backend, Deploy | PDF parser, TTS integration, HITL layer, API server, Deploy lên Railway/Render |
| Frontend / UX | Lê Minh Tuấn | Web UI, Wireframe, UX flow | Hoàn thiện Figma (Core Functions), thiết kế "Quiet Premium", Study Desk layout, tối ưu Readability cho học sinh khiếm thính |
| Data / QA / PM | ________Cao________ | Data, Eval, Research, Docs | Định hướng Product Pivot, Refactor Role, Quản lý Roadmap & Feedback |

💡 Lưu ý: Bước Demo & Báo cáo cuối (Bước 7) là việc chung của cả team — không ai được "phủi tay".

**TUẦN 1**

**Brief · Research · Setup**

Bước 1 — Đọc kỹ đề bài · Competitor analysis · Khởi tạo hạ tầng

### **Việc cần làm theo bước framework**

* **Briefing (cả team cùng làm):** Đọc đề AI20K-200. Viết lại bằng ngôn ngữ của mình: user là ai, đau ở đâu, workaround hiện tại là gì.

* **Research competitor:** Google / ProductHunt / GitHub → tìm 3 sản phẩm accessibility tương tự (Otter.ai, NaturalReader, Microsoft Immersive Reader, Be My Eyes AI...). Phân tích ưu/nhược/gap.

* **Xác định điểm khác biệt:** Tại sao sản phẩm này khác? Lợi thế cạnh tranh cụ thể là gì?

* **Khởi tạo hạ tầng:** Tạo GitHub repo (monorepo hoặc tách frontend/backend), setup môi trường dev, chọn tech stack dứt khoát.

* **Tech stack đề xuất:** Python (FastAPI/Flask) + PyMuPDF + Azure TTS (hoặc Viettel AI) + React/Next.js + PostgreSQL/Supabase.

* **OCR Research (Nam):** Test [Chandra-OCR-2](https://huggingface.co/datalab-to/chandra-ocr-2) hoặc [HunyuanOCR](https://huggingface.co/tencent/HunyuanOCR) để trích xuất nội dung từ PDF/Image. Với Chandra, thử nghiệm cả option chạy local và call API.

### **Kế hoạch theo ngày (gợi ý)**

| Ngày | Tech Lead / AI | Frontend / UX | Data / QA / PM |
| :---- | :---- | :---- | :---- |
| Ngày 1–2 | Setup GitHub repo, môi trường Python (uv), cài thư viện PDF parser | Setup Next.js project, cài Tailwind, tạo layout skeleton | Research 3 competitor, điền bảng ưu/nhược/gap |
| Ngày 3–4 | Test thử PyMuPDF parse 1 file PDF. **Test Chandra OCR (Local/API) hoặc HunyuanOCR** | Sketch wireframe 2 màn hình chính (upload + nghe) | Viết Problem Statement theo công thức chuẩn, phỏng vấn 2–3 SV (nếu được) |
| Ngày 5 | Họp kỹ thuật: chốt tech stack, phân task Tuần 2 | Trình bày wireframe sketch → lấy feedback nội bộ | Hoàn thiện 1-page brief, gộp vào repo /docs |

### **Output phải có cuối tuần**

* **GitHub repo khởi tạo:** README, cấu trúc thư mục rõ ràng (`src/frontend`, `src/backend`), .gitignore, .env.example.

* **1-page brief:** User persona, Problem statement, Competitor analysis (3 sản phẩm), Điểm khác biệt.

* **Tech stack đã chốt:** Chốt library OCR (Chandra/Hunyuan/PyMuPDF).

* **Wireframe sketch:** Ít nhất 2 màn hình (upload flow + audio player). Có thể vẽ tay, chụp ảnh, upload lên /docs.

### **Rủi ro & cách xử lý**

* **Rủi ro:** PyMuPDF không parse được tài liệu có bảng/công thức → Kế hoạch B: dùng LlamaParse (API free tier) hoặc Marker.

* **Rủi ro:** Không tìm được SV khiếm thị để phỏng vấn → Dùng screen reader (NVDA) tự test để cảm nhận pain.

### **Checkpoint — họp cuối tuần (30 phút)**

* **Demo:** Parse 1 file PDF thật → in ra cấu trúc (heading, bullet, body) trong terminal.

* **Câu hỏi họp:** (1) Tech stack đã chốt chưa? (2) Ai còn vướng gì? (3) Task Tuần 2 đã clear chưa?

**TUẦN 2**

**PRD · Data · AI Pipeline**

Bước 2 + 3 + Sprint 1 — PRD chi tiết · Dataset · AI pipeline chạy được local

### **Việc cần làm theo bước framework**

* **PRD (Product Requirements Doc):** Viết User Stories theo mẫu "Là [role], tôi muốn [action] để [benefit]". Phân loại Core vs Nice-to-have. Ưu tiên matrix.

* **Data pipeline:** Thu thập 20–50 file PDF học thuật (giáo trình, bài giảng). Label thủ công: heading, bullet, bảng, công thức. Tạo ground truth audio (đọc thử = baseline).

* **AI pipeline Sprint 1:** PDF Parser → Cleaner → TTS. Chưa cần UI. Chạy được bằng script Python là đủ.

* **HITL logic:** Implement flag: nếu parser phát hiện bảng/công thức phức tạp → gắn tag "needs_review".

* **Traceability:** Mỗi đoạn audio output phải biết từ trang/đoạn nào trong file gốc.

### **Kế hoạch theo ngày (gợi ý)**

| Ngày | Tech Lead / AI | Frontend / UX | Data / QA / PM |
| :---- | :---- | :---- | :---- |
| Ngày 1–2 | Implement PDF parser + structure extractor (heading/bullet/body tách riêng) | Hoàn thiện wireframe Figma (upload, audio player, review flag) | Thu thập 30 file PDF học thuật, viết User Stories cho PRD |
| Ngày 3–4 | Tích hợp Azure TTS API (hoặc Viettel AI), test với 5 file | Setup component library, build Upload component | Label 10 file PDF (heading/bullet/table/formula), tạo ground truth |
| Ngày 5 | End-to-end script: PDF → parse → TTS → audio file ra ngoài | Build Audio Player component với timestamp | Tính WER thử nghiệm trên 5 file đầu, ghi vào spreadsheet |

### **Output phải có cuối tuần**

* **PRD document:** User stories (ít nhất 8), Feature priority matrix (Core/Nice-to-have/Phase 2).

* **Dataset v1:** 20+ file PDF học thuật, đã label, có ground truth cho 5 file.

* **AI pipeline script:** Chạy python convert.py input.pdf → output.mp3 được. Có log traceability.

* **Demo:** Chạy script trực tiếp → play audio → cả team nghe thử → rate quality.

### **Rủi ro & cách xử lý**

* **Rủi r:** Azure TTS quota hết / latency cao → Kế hoạch B: edge-tts (local, free, tiếng Việt tốt) hoặc gTTS.

* **Rủi ro:** Pipeline quá chậm (>2 phút/file) → Xử lý bất đồng bộ, progress bar, không block UI.

### **Checkpoint — họp cuối tuần (30 phút)**

* **Demo:** Cả team nghe output audio của 3 loại tài liệu: slide đơn giản, giáo trình có bảng, slide có công thức.

* **Câu hỏi họp:** (1) WER đo được bao nhiêu? (2) Trường hợp nào parser fail? (3) PRD đã đủ rõ để code không?

**TUẦN 3**

**Kiến trúc · Web UI · Tích hợp**

Bước 4 + Sprint 2 — System design · Web UI kết nối AI · Auth

### **Việc cần làm theo bước framework**

* **System architecture diagram:** Vẽ luồng Frontend ↔ Backend API ↔ AI pipeline ↔ Database. Đưa vào /docs.

* **Database schema:** Thiết kế bảng: users, documents, conversions, audit_log (traceability). Dùng Supabase hoặc PostgreSQL.

* **API spec:** POST /upload, GET /conversions/:id, GET /audio/:id, POST /flag. Dùng Swagger hoặc markdown đơn giản.

* **Auth flow:** Đăng ký/đăng nhập (email + password). Role: student, reviewer (HITL). Dùng Supabase Auth hoặc NextAuth.

* **Web UI kết nối AI:** Upload file → Backend → AI pipeline → Trả audio → Play. End-to-end chạy được qua trình duyệt.

### **Kế hoạch theo ngày (gợi ý)**

| Ngày | Tech Lead / AI | Frontend / UX | Data / QA / PM |
| :---- | :---- | :---- | :---- |
| Ngày 1–2 | Setup FastAPI server, implement /upload endpoint, kết nối AI pipeline | Build Upload page (drag & drop), progress indicator, kết nối API | Vẽ system architecture diagram, viết DB schema |
| Ngày 3–4 | Implement auth (Supabase), DB schema, audit log | Build Audio Player page, flag button (HITL), conversion history | Setup Supabase, test auth flow, viết API spec markdown |
| Ngày 5 | End-to-end test: upload → process → play qua browser | Polish UI, responsive check, loading states | Test 10 file qua web UI, ghi lỗi vào issue tracker |

### **Output phải có cuối tuần**

* **Web app chạy local:** Upload PDF → nhận audio → play được trong browser. Auth hoạt động.

* **System architecture diagram:** Clear, đã review, đưa vào README.

* **DB schema:** Đã migrate, đã test CRUD cơ bản.

* **Demo:** Cả team test flow upload từ máy của nhau (không phải localhost của người làm).

### **Rủi ro & cách xử lý**

* **Rủi ro:** Upload file lớn timeout → Implement chunked upload hoặc giới hạn 10MB, xử lý async với job queue.

* **Rủi ro:** Auth phức tạp mất thời gian → Dùng Supabase Auth (30 phút setup) thay vì tự viết.

### **Checkpoint — họp cuối tuần (30 phút)**

* **Demo:** Upload 1 file PDF từ máy của người không làm code → phải chạy được. Nếu không chạy = chưa đạt.

* **Câu hỏi họp:** (1) Flow có smooth không? (2) Lỗi nào chưa handle? (3) Ready để deploy tuần sau?

**TUẦN 4**

**Polish · Deploy · User Test**

Sprint 3 + 4 + Bước 6 — Edge cases · Production deploy · Feedback thật

### **Việc cần làm theo bước framework**

* **Sprint 3 — Edge cases:** File PDF quét (scanned) → fallback. Công thức toán → flag HITL. File không phải text → error message rõ ràng.

* **Sprint 4 — Polish UI/UX:** Loading states, empty states, error states. Mobile responsive. Accessibility của chính UI (ironic nếu UI không accessible).

* **Deploy production:** Frontend → Vercel. Backend → Railway hoặc Render. DB → Supabase. Phải có URL thật, SSL.

* **Monitoring:** Log errors (Sentry free tier). Basic uptime check. Ghi lại errors ra file.

* **User testing:** Mời 5–10 người dùng thật (bạn bè SV, người thân). Quan sát họ dùng — không hướng dẫn. Ghi lại feedback.

### **Kế hoạch theo ngày (gợi ý)**

| Ngày | Tech Lead / AI | Frontend / UX | Data / QA / PM |
| :---- | :---- | :---- | :---- |
| Ngày 1–2 | Handle edge cases: scanned PDF, large file, timeout, empty document | Polish UI: loading/error/empty states, mobile responsive | Viết test script cho user testing, chuẩn bị câu hỏi phỏng vấn sau dùng |
| Ngày 3 | Deploy backend lên Railway/Render, setup env vars production | Deploy frontend lên Vercel, kết nối production backend | Test production URL từ đầu đến cuối |
| Ngày 4–5 | Setup Sentry, fix bugs từ user test | Sửa UI bugs từ user test, final responsive check | Chạy user test với 5 người, ghi feedback log, tính same-day usage rate |

### **Output phải có cuối tuần**

* **URL production hoạt động:** Có SSL, không crash, load được trên mobile.

* **User feedback log:** Ít nhất 5 người test, ghi nhận quote thực tế, issues gặp phải.

* **Monitoring setup:** Sentry hoặc tương đương, có error log.

* **Bug list:** Ghi tất cả bugs phát hiện, phân loại P0 (blocker) vs P1 (nice-to-fix).

### **Rủi ro & cách xử lý**

* **Rủi ro:** Deploy fail do env vars → Checklist env vars trước khi deploy. Dùng .env.example làm template.

* **Rủi ro:** User test không ai có disability thật → OK, test với người bình thường nhắm mắt dùng screen reader cũng có insight.

### **Checkpoint — họp cuối tuần (30 phút)**

* **Demo:** Cả team vào URL production từ điện thoại → upload file → nhận audio. Nếu không được trên mobile = lỗi.

* **Câu hỏi họp:** (1) Feedback nào quan trọng nhất? (2) Bug P0 nào chưa fix? (3) Story để kể Tuần 5 là gì?

**TUẦN 5**

**Final · Stabilize · Demo Prep**

Bước 7 — Ổn định · GitHub clean · Slide · Demo live

### **Việc cần làm theo bước framework**

* **Stabilize:** Fix tất cả P0 bugs. Không add feature mới Tuần 5. Tập trung ổn định.

* **GitHub cleanup:** Clean commit history, xóa file rác, viết README đầy đủ (setup, run, deploy, architecture).

* **Slide tóm tắt:** Bài toán → Giải pháp → Kiến trúc → Demo → Lessons learned. Không quá 10 slides.

* **Demo script:** Rehearse flow demo live. Không dùng video quay sẵn. Có plan B nếu internet chậm (localhost backup).

* **Lessons learned:** Ghi thật: làm được gì, chưa làm được gì, nếu làm lại sẽ thay đổi gì.

### **Kế hoạch theo ngày (gợi ý)**

| Ngày | Tech Lead / AI | Frontend / UX | Data / QA / PM |
| :---- | :---- | :---- | :---- |
| Ngày 1–2 | Fix P0 bugs, cleanup backend code, viết docstring | Fix UI bugs, viết README frontend, cleanup CSS | Viết README tổng, architecture section, data pipeline doc |
| Ngày 3 | Final deploy check, test production end-to-end | Build slide (Figma hoặc Canva) phần UI/UX + Demo screenshots | Build slide phần Problem + Architecture + Metrics |
| Ngày 4–5 | Rehearse demo live, chuẩn bị laptop backup | Rehearse flow trình bày, chuẩn bị câu trả lời Q&A | Finalize slide, in checklist nộp bài, submit |

### **Output phải có cuối tuần**

* **GitHub repo sạch:** README đầy đủ, không có file rác, có hướng dẫn setup/run/deploy.

* **Slide ≤ 10 trang:** Bài toán → Giải pháp → Kiến trúc → Demo → Lessons learned.

* **Demo live script:** Đã rehearse ít nhất 2 lần. Có plan B (localhost) nếu internet lag.

* **URL production stable:** Không crash trong 24h trước demo.

### **Rủi ro & cách xử lý**

* **Rủi ro:** Internet chậm khi demo → Chuẩn bị localhost backup, có video ngắn 1 phút làm fallback (không phải thay thế).

* **Rủi ro:** Slide quá nhiều → Hard limit 10 slides. Mỗi slide 1 ý. Demo live mới là trọng tâm.

### **Checkpoint — họp cuối tuần (30 phút)**

* **Final rehearsal:** Demo live toàn bộ flow từ đầu đến cuối. Cả team ngồi xem, ghi nhận.

* **Câu hỏi cuối:** (1) Tự hào nhất điều gì? (2) Lessons learned thật sự là gì? (3) Nếu có thêm 1 tuần, làm gì đầu tiên?

# **VIII. Quy tắc làm việc nhóm**

### **Quy tắc kỹ thuật**

* **Git flow:** main branch luôn chạy được. Feature → PR → review → merge. Không push thẳng lên main.

* Tạo nhánh theo git flow

* **Commit message:** [feat/fix/docs/refactor] mô tả ngắn. Ví dụ: [feat] add PDF heading extractor. (commit theo chuẩn commitizen)

* **Không để broken code trên main:** Nếu chưa xong, để trên feature branch.

* **.env:** KHÔNG bao giờ commit file .env. Dùng .env.example với placeholder.

* các file nặng, dependencies bỏ vào **.gitignore**

* **PR size:** Mỗi PR ≤ 300 lines thay đổi. PR lớn hơn = tách nhỏ.

* Khởi tạo môi trường [uv](https://docs.astral.sh/uv/concepts/projects/init/)

### **Quy tắc họp**

* **Cuối mỗi tuần:** 30 phút họp. 10 phút update, 10 phút review output, 10 phút plan tuần sau.

* **Format update:** "Tuần này tôi làm xong X, bị stuck ở Y, tuần sau sẽ làm Z."

* **Không blame:** Nếu task trễ, báo sớm và re-assign. Blame không giải quyết được gì.

### **Quy tắc ra quyết định**

* **Tech choice:** Tech Lead quyết định sau khi nghe input cả team. Không vote vô tận.

* **Scope creep:** Bất kỳ feature mới nào ngoài PRD phải được cả team đồng ý VÀ không ảnh hưởng deadline.

* **Bất đồng kỹ thuật:** Build proof-of-concept nhỏ (max 2 tiếng) rồi quyết định dựa trên data, không tranh luận lý thuyết.

# **IX. Checklist nộp bài cuối kỳ**

Tick từng mục trước khi submit. Thiếu bất kỳ mục nào = chưa đạt yêu cầu tối thiểu.

| ✓ | Hạng mục | Người chịu trách nhiệm | Tuần hoàn thành |
| :---- | :---- | :---- | :---- |
| [x] | GitHub repo public, có README đầy đủ (setup, run, deploy) | Cả team | Tuần 5 |
| [x] | URL production hoạt động, có SSL, không crash | Tech Lead | Tuần 4 |
| [x] | Demo live chạy được toàn bộ flow (upload → audio) | Cả team | Tuần 5 |
| [x] | 1-page brief (user persona, problem, competitor) | Data/PM | Tuần 1 |
| [x] | PRD với user stories và feature priority matrix | Data/PM | Tuần 2 |
| [x] | System architecture diagram trong README | Tech Lead | Tuần 3 |
| [x] | Dataset đã xử lý + data pipeline doc | Data/PM | Tuần 2 |
| [x] | WER ≤ 5% (đo trên ít nhất 10 file) | Data/PM | Tuần 3–4 |
| [x] | MOS ≥ 4.5 (ít nhất 5 người rate) | Data/PM | Tuần 4 |
| [x] | User feedback log (≥ 5 người test thật) | Data/PM | Tuần 4 |
| [x] | Slide trình bày ≤ 10 trang | Cả team | Tuần 5 |
| [x] | Monitoring/error log setup (Sentry hoặc tương đương) | Tech Lead | Tuần 4 |
| [x] | HITL layer hoạt động (flag + reviewer flow) | Tech Lead | Tuần 3 |
| [x] | Traceability: mỗi audio biết nguồn từ đoạn văn nào | Tech Lead | Tuần 2 |

# **X. Nhật ký Tiến độ & Thành tựu (Actual Progress)**

Phần này ghi lại các thay đổi thực tế và quyết định quan trọng đã thực hiện trong quá trình phát triển (Cập nhật ngày 28/04).

### **1. Chiến lược & Sản phẩm (Product Pivot)**
*   **Tái định hướng (Deaf-First):** Chuyển trọng tâm từ hỗ trợ khiếm thị sang hỗ trợ học sinh khiếm thính (Deaf/Hard of Hearing). Loại bỏ tính năng "Document-to-Audio" để tập trung vào Captioning & Transcription.
*   **Tái cấu trúc vai trò (Role Overhaul):** Hợp nhất và chuyển giao các công cụ mạnh mẽ của Giáo viên (Upload, AI Transcription, Summary) sang cho Học sinh sử dụng trực tiếp để tối ưu hóa việc tự học.
*   **Loại bỏ tính năng thừa:** Xóa bỏ "Live Sessions" và các module không thiết yếu để giữ ứng dụng tinh gọn, tập trung vào giá trị lõi.

### **2. Giao diện & Trải nghiệm (UI/UX Redesign)**
*   **Hoàn thiện Figma Core Functions:** Đã thiết kế xong luồng trải nghiệm lõi cho học sinh khiếm thính trên Figma (bao gồm màn hình Dashboard, Video Player với Caption/Transcript, và Review Summary).
*   **Triết lý "Quiet Premium":** Thay thế giao diện SaaS hào nhoáng bằng phong cách "Học thuật tĩnh lặng". Sử dụng bảng màu Soft Navy/Slate và font chữ chuyên dụng cho việc đọc dài hạn.
*   **Study Desk Layout:** Chuyển đổi từ Dashboard quản trị sang bố cục "Bàn học" với cấu trúc thẻ Notebook, ưu tiên nội dung bài giảng thay vì các chỉ số hệ thống.
*   **Thiết kế hỗ trợ học tập:** Bổ sung khối "Continue Learning" và "Missed Moments" (Khoảnh khắc bỏ lỡ) giúp học sinh dễ dàng bắt kịp bài giảng.

### **3. Kỹ thuật & Hạ tầng (Frontend Architecture)**
*   **Refactor Routes:** Chuyển đổi toàn bộ hệ thống routing từ `/teacher/*` sang `/student/*` để đồng bộ với định hướng sản phẩm mới.
*   **Fix Core Bugs:** Xử lý triệt để lỗi "infinite refresh loop" trên Next.js và lỗi mất trạng thái (state reset) khi chuyển trang.
*   **AI Observability:** Tích hợp thành công `log_hook.py` để theo dõi và báo cáo mọi hoạt động của AI lên hệ thống giám sát.

### **4. Tinh chỉnh Giao diện & Trải nghiệm Người dùng (Tuần 5)**
*   **Video Lesson UI:** Tái thiết kế trang xem bài giảng (`VideoLessonPage`), tối ưu hóa bố cục chia cột (Video + Transcript). Phóng to font chữ ở phụ đề và thanh Transcript để học sinh dễ đọc hơn ("cân vừa mắt"). Cung cấp hướng dẫn rõ ràng vị trí tích hợp Video Player thực tế.
*   **Mô phỏng Upload Flow:** Xây dựng tính năng "Mock Upload" với giao diện kéo thả, thanh tiến trình (progress bar) mô phỏng quá trình xử lý video và tự động chuyển hướng người dùng sau khi hoàn tất.
*   **Layout Centering & Balance:** Căn giữa toàn bộ nội dung của các trang chính (Dashboard, Enrolled Courses, Settings) bằng giới hạn `max-w-6xl`, ngăn chặn tình trạng giao diện bị kéo giãn quá mức trên các màn hình siêu rộng.
*   **Tối giản AppSidebar:** Thu gọn kích thước thanh điều hướng (từ 280px xuống 240px), đẩy sát vào mép trái màn hình, giảm kích thước font chữ và icon để tạo cảm giác gọn gàng, tinh tế hơn. Loại bỏ Floating Action Button không cần thiết khỏi layout.
*   **Fix Hydration Mismatch:** Khắc phục triệt để lỗi React Hydration trên Next.js bằng cách thêm thuộc tính `suppressHydrationWarning`, ngăn chặn xung đột DOM từ các trình duyệt extension của người dùng.

### **5. Đồng bộ hóa Hệ thống & Tính năng Nâng cao (Tuần 5 - Cập nhật 30/04)**
*   **Auth Flow & State Management:** Hoàn thiện luồng đăng nhập/đăng ký giả lập tích hợp với `Zustand`. Dữ liệu người dùng và trạng thái đăng nhập được duy trì (persistence) qua `localStorage`.
*   **Đồng bộ hóa "Rose Theme":** Đồng bộ hóa toàn bộ bảng màu của Dashboard, Sidebar và trang bài giảng theo tông màu Hồng (Rose/Pink) của giao diện Auth, tạo sự nhất quán thương hiệu từ đầu đến cuối.
*   **Hệ thống Settings & Accessibility:** Triển khai trang Cấu hình chuyên sâu cho học sinh UDL:
    *   Tùy chỉnh kích thước chữ (S, M, L, XL) cho Transcript/Summary.
    *   Chuyển đổi giao diện Sáng/Tối (Light/Dark Mode).
    *   Chế độ tương phản cao (High Contrast) và Tự động cuộn (Auto-scroll).
*   **Landing Page Overhaul (Warm Editorial):** Tái thiết kế toàn bộ trang chủ theo phong cách "Warm Editorial Product". Sử dụng font chữ **Fraunces** giàu cá tính, nền kem ấm, hình ảnh thực tế và các thẻ UI tinh tế thay vì mockup generic.
*   **Hệ thống Tiện ích Chung:** Xây dựng file `lib/utils.ts` chứa hàm `cn` dùng chung cho toàn bộ dự án, tối ưu hóa việc quản lý class Tailwind CSS.
*   **Kích hoạt Điều hướng Dashboard:** Kết nối các thẻ khóa học và nút bấm trên Dashboard với trang bài giảng thực tế, hoàn thiện luồng trải nghiệm người dùng (End-to-end user flow).

---
**"Đừng build rộng, hãy BUILD TRÚNG.**

**Yêu problem, đừng yêu solution. AI là công cụ, không phải value."**

AI20K-200  ·  Universal Design for Learning  ·  Product Survival Roadmap