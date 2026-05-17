# 📚 Dreams — Nền tảng Học tập Thông minh Ứng dụng AI cho Sinh viên Khiếm thính

> Nền tảng E-learning tiên phong tích hợp trí tuệ nhân tạo, tự động hóa quy trình phân tích bài giảng và chuyển đổi sang ngôn ngữ ký hiệu (VSL), đồng bộ các tài nguyên học tập thông minh nhằm tối ưu hóa trải nghiệm học tập bình đẳng cho cộng đồng người khiếm thính.

---

## 🔗 Quick Links (Liên kết nhanh)

| Hạng mục | Đường dẫn liên kết |
| :--- | :--- |
| 🌐 **Live URL** | *https://main.d1vyf197dtmhjw.amplifyapp.com/* |
| 🎬 **Video Demo** | *[Đang cập nhật link YouTube]* |
| 📊 **Pitch Deck** | *[[Team 075] - Dreams - Pitch Deck.pdf](https://drive.google.com/file/d/1oUSMvy4ltEoQWZUIa2C5Pqt01yG5_tS6/view?usp=sharing)* |
| 🏗️ **Kiến trúc hệ thống** | [docs/architecture.md](docs/architecture.md) |
| 🤖 **AI Logs & Prompts** | [docs/ai-logs.md](docs/ai-logs.md) |
| 📋 **Nhật ký dự án (Worklog)** | [docs/worklog.md](docs/worklog.md) |
| 📈 **Báo cáo kiểm thử & Đánh giá** | [docs/evaluation-report.md](docs/evaluation-report.md) |

---

## 1. 🌟 Giới thiệu dự án
**Dreams** (Mã dự án: **A20-App-075**) là một nền tảng quản lý học tập (LMS) thế hệ mới, ứng dụng các mô hình ngôn ngữ lớn (LLM) và công nghệ xử lý âm thanh/hình ảnh tiên tiến. Hệ thống tự động chuyển hóa các video bài giảng truyền thống thành các định dạng tài nguyên tương tác thông minh, giúp sinh viên khiếm thính dễ dàng tiếp cận, tự học và tự đánh giá năng lực một cách hiệu quả nhất.

---

## 2. ⚠️ Vấn đề cần giải quyết (Pain Points)
Học trực tuyến (E-learning) bùng nổ mang lại cơ hội tiếp cận tri thức lớn, nhưng lại tạo ra rào cản khổng lồ đối với sinh viên khiếm thính:
*   **Thiếu phụ đề chuẩn xác:** Phụ đề tự động của các nền tảng thông thường không hỗ trợ tốt thuật ngữ chuyên ngành học thuật tiếng Việt.
*   **Thiếu hỗ trợ ngôn ngữ ký hiệu:** Tiếng Việt viết và Ngôn ngữ ký hiệu (VSL) có ngữ pháp khác biệt; việc chỉ đọc chữ khiến người khiếm thính mệt mỏi và khó tiếp thu nhanh.
*   **Quá tải thông tin:** Việc vừa tập trung nhìn giảng viên, vừa đọc phụ đề chạy nhanh khiến sinh viên khiếm thính rất khó tự ghi chép hoặc tóm tắt ý chính bài học.

---

## 3. 💡 Giải pháp đột phá của Dreams
Dreams tái cấu trúc hoàn toàn trải nghiệm bài giảng video thông qua 3 trụ cột giải pháp:
1.  **Chuyển đổi đa phương thức tự động:** Trích xuất và dịch thuật phụ đề chính xác bằng Whisper AI, kết hợp sinh hệ thống ký hiệu số hóa (Avatar VSL / Handsign) hỗ trợ trực quan.
2.  **Đồng bộ tài nguyên tương tác thông minh:** Tự động tạo Sơ đồ tư duy (Mindmap) và Phân đoạn bài giảng (Timeline) có liên kết thời gian với video, cho phép người học **bấm vào các mốc thời gian hoặc các node tương ứng trên sơ đồ** để video tự động nhảy đến đúng phân đoạn bài giảng.
3.  **Tự động hóa giáo án cá nhân:** AI tự động thiết kế Slide PPTX theo nhiều mẫu chuẩn học thuật chuyên nghiệp, đi kèm ngân hàng Quiz trắc nghiệm và Flashcard lật thông minh giúp ôn tập tại chỗ.

---

## 🚀 4. Các tính năng cốt lõi

### 🎬 A. Trình phát video & Phụ đề thông minh
*   **Range Request Streaming:** Hỗ trợ phát video dạng stream phân đoạn, cho phép tua nhanh mượt mà mà không bị giật lag hay tải lại toàn bộ file.
*   **Phụ đề đa ngôn ngữ đồng bộ:** Tự động tách âm thanh (FFmpeg) và chuyển đổi giọng nói thành văn bản bằng Whisper AI với độ chính xác cao.

### 🧠 B. Trợ lý phân tích bài giảng AI
*   **Sơ đồ tư duy (Interactive Mindmap):** Hệ thống tạo Mindmap dạng cây tương tác. Điểm đặc biệt: **mỗi node sơ đồ gắn với một timestamp**. Người học bấm vào node nào, trình phát video sẽ lập tức nhảy đến phân đoạn giảng giải phần đó.
*   **Cấu trúc thời gian & Điểm nhấn (Timeline & Highlights):** Tự động phân tích các mốc thời gian quan trọng và tóm tắt những ý chính của bài giảng dưới dạng bullet points.
*   **Làm rõ khái niệm (Briefing):** Liệt kê và định nghĩa rõ ràng các thuật ngữ chuyên ngành xuất hiện trong bài giảng.

### 🎨 C. Tạo Slide AI chuyên nghiệp & Quản lý lịch sử
*   **AI PPTX Generator:** Người dùng chọn trong **10 mẫu template slide** khác nhau và nhập số lượng trang mong muốn. AI sẽ tự động phân tích transcript và xuất ra file PowerPoint hoàn chỉnh.
*   **Bảo toàn dữ liệu lịch sử:** Tích hợp cơ sở dữ liệu `GeneratedSlide` giúp lưu lại toàn bộ các slide đã từng tạo theo tài khoản. Người dùng có thể xem lại và tải xuống bất cứ lúc nào thông qua tab Slide của bài học hoặc trang quản lý lịch sử slide tập trung (`/student/slides`).

### ✍️ D. Tự học & Đánh giá năng lực
*   **Quiz trắc nghiệm:** Tự động tạo bộ câu hỏi trắc nghiệm kèm đáp án và giải thích chi tiết dựa trên nội dung video.
*   **Flashcards học thuật:** Bộ thẻ từ ghi nhớ hai mặt giúp củng cố kiến thức và thuật ngữ cốt lõi nhanh chóng.

### 👤 E. Trình điều khiển cho Giảng viên & Admin
*   **Dashboard quản trị:** Cho phép tạo khóa học, quản lý danh sách học viên, phân quyền người dùng và tải lên bài giảng mới.
*   **Reprocess Pipeline:** Nút bấm cho phép xử lý lại (reprocess) video từ đầu trong trường hợp cần cập nhật hoặc sửa lỗi pipeline.

---

## 🏗️ 5. Kiến trúc hệ thống & Luồng dữ liệu

Hệ thống được thiết kế theo mô hình Microservices phân lớp, đảm bảo tính mở rộng cao và vận hành bất đồng bộ an toàn:

![Kiến trúc hệ thống](docs/architecture.png)

👉 **Để xem phân tích chi tiết các luồng đi của dữ liệu (Sequence Diagrams) và thiết kế cơ sở dữ liệu (Database Schema ERD) đầy đủ của dự án, vui lòng truy cập:** [Tài liệu Kiến trúc & Thiết kế Cơ sở Dữ liệu](docs/architecture.md).

---

## 🛠️ 6. Công nghệ sử dụng

| Thành phần | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS v4 | Xây dựng giao diện ứng dụng tương tác đa phương thức mượt mà. |
| **Frontend State & UI** | Zustand, Framer Motion, Recharts, Lucide Icons | Quản lý state toàn cục tối ưu, thiết kế micro-animations, vẽ biểu đồ học tập trực quan. |
| **Backend & Security** | FastAPI, Python 3.12, SQLModel (SQLAlchemy + Pydantic) | Thiết kế hệ thống RESTful API bất đồng bộ (async), kiểm chuẩn dữ liệu chặt chẽ. |
| **Xác thực & Bảo mật** | JWT (python-jose), mật khẩu bcrypt (passlib) | Quản lý phiên đăng nhập an toàn, phân quyền nhiều lớp (student/admin). |
| **Database & Migrations**| PostgreSQL (Prod), SQLite (Dev), **Alembic** | Hệ quản trị cơ sở dữ liệu quan hệ kết hợp quản lý phiên bản schema migration chặt chẽ. |
| **Message Queue** | Redis + Python RQ (Redis Queue) | Hàng đợi tin nhắn xử lý song song các tác vụ nặng (tách nhạc, gọi AI) bất đồng bộ. |
| **AI Integration** | OpenAI GPT-4o-mini, **faster-whisper**, **Replicate API** | Chuyển giọng nói sang chữ siêu tốc, phân tích nội dung chuyên sâu và xử lý avatar số hóa. |
| **Media & Doc Engine** | FFmpeg-python, **python-pptx**, yt-dlp | Trích xuất nhạc bài giảng, tự động lắp ghép dữ liệu sinh slide PowerPoint, tải video. |
| **DevOps & QA** | **Pytest**, PowerShell & Bash QA scripts | Xây dựng bộ kịch bản kiểm thử tích hợp backend tự động và script khói chạy smoke test nhanh hệ thống. |
| **Hạ tầng (Infrastructure)** | **AWS Cloud** (EC2, RDS PostgreSQL, S3), **Docker & Docker Compose**, Amplify, Nginx, bảo mật **Presigned S3 URLs**, GitHub Actions CI/CD | Đóng gói container đa dịch vụ chạy độc lập, quản lý an toàn dữ liệu media, cấu hình reverse proxy bảo mật và tự động hóa deploy. |

---

## 💻 7. Hướng dẫn cài đặt & Chạy dưới Local

### Yêu cầu hệ thống
*   Python `>= 3.12`
*   Node.js `>= 18`
*   Docker & Docker Compose

### Cách 1: Chạy bằng Docker Compose (Khuyến nghị - Nhanh nhất)
1.  **Clone mã nguồn:**
    ```bash
    git clone https://github.com/a20-ai-thuc-chien/A20-App-075.git
    cd A20-App-075
    ```
2.  **Cấu hình biến môi trường:**
    Sao chép file cấu hình mẫu và điền `OPENAI_API_KEY`, `SECRET_KEY` của bạn:
    ```bash
    cp .env.example .env
    ```
3.  **Khởi động toàn bộ hệ thống:**
    ```bash
    docker compose up --build
    ```
4.  **Tạo database schema (Alembic Migration):**
    Mở một cửa sổ terminal mới và chạy lệnh tạo bảng:
    ```bash
    docker compose exec backend python -m alembic upgrade head
    ```
5.  **Truy cập hệ thống:**
    *   Giao diện người dùng (Frontend): `http://localhost:3000`
    *   Tài liệu API (Backend Swagger): `http://localhost:8000/docs`

---

### Cách 2: Setup thủ công từng phần (Dành cho Lập trình viên)

#### 1. Setup Backend:
```bash
# Tạo môi trường ảo
python -m venv venv
source venv/bin/activate  # Trên Windows: .\venv\Scripts\Activate.ps1

# Cài đặt thư viện
python -m pip install -U pip
python -m pip install -r requirements.txt

# Run migrations
python -m alembic upgrade head

# Chạy API Server
python -m uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Chạy Redis & Worker (Bắt buộc để chạy AI Pipeline):
```bash
# Khởi chạy Redis bằng Docker
docker run -d --name a20-redis -p 6379:6379 redis:7-alpine

# Chạy Worker (Mở terminal mới, kích hoạt venv)
python -m src.backend.scripts.run_worker
```

#### 3. Setup Frontend:
```bash
cd src/frontend
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

---

## 🔑 8. Biến môi trường cốt lõi (.env)

Không được phép commit file `.env` chứa key thật lên GitHub. Dưới đây là các cấu hình tối thiểu trong `.env.example`:

```bash
# API Keys bảo mật
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_jwt_secret_key_here

# Môi trường chạy
ENVIRONMENT=development

# Database cấu hình
DATABASE_URL=sqlite:///data/lecture_platform.db
REDIS_URL=redis://localhost:6379/0

# Cấu hình Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📌 9. Phân quyền & Quản lý User (Production-safe)

Để đảm bảo tính bảo mật trong vận hành thực tế, việc phân quyền người dùng được thiết lập thông qua phân lớp trong database:
1.  **Mặc định đăng ký:** Người dùng đăng ký tự do từ ngoài giao diện sẽ có quyền mặc định là học sinh (`student`).
2.  **Nâng cấp quyền Admin/Teacher:** Admin có thể thúc đẩy vai trò (promote) cho người dùng khác thông qua câu lệnh CLI an toàn:
    ```bash
    python -m src.backend.scripts.promote_user_role --email [EMAIL_CẦN_NÂNG_QUYỀN] --role admin
    ```

---

## 📝 10. Đánh giá kiểm thử (QA / Evaluation)

Hệ thống được kiểm thử nghiêm ngặt thông qua bộ test tích hợp backend và script khói (smoke test):
*   **Chạy toàn bộ unit test backend:**
    ```bash
    python -m pytest -q src/backend/tests
    ```
*   **Chạy script smoke test kiểm tra liên kết hệ thống:**
    ```bash
    # Windows PowerShell
    .\scripts\qa_smoke.ps1
    ```

Chi tiết kịch bản người dùng thử nghiệm và bảng kết quả đánh giá thực tế xem tại: [docs/evaluation-report.md](docs/evaluation-report.md).

---

## 👥 11. Thành viên nhóm & Phân công công việc

| Thành viên | Vai trò | Nhiệm vụ chính |
| :--- | :--- | :--- |
| **Lê Minh Tuấn - 2A202600379** | Frontend Engineer & Deployment | Phụ trách phát triển giao diện Frontend bằng Next.js, xây dựng Landing Page, Dashboard, Theater Mode và hệ thống subtitle trực quan cho sinh viên khiếm thính. Thiết kế UI/UX theo hướng accessibility, responsive và tối ưu trải nghiệm người dùng. Tích hợp video player, kết nối FE với Backend APIs, build Docker Frontend và hỗ trợ deploy hệ thống lên Railway/AWS Cloud. |
| **Nguyễn Trí Cao - 2A202600223** | AI Research & Fullstack Support | Research các giải pháp AI hỗ trợ accessibility như Text-to-Visual Sign Language, Avatar HandSign, Infographic Generation và các tính năng tương tự NotebookLM. Thu thập tài liệu học thuật, xây dựng User Stories, nghiên cứu UI/UX behavior và hỗ trợ định hình problem statement, persona. Đồng thời hỗ trợ chỉnh sửa FE, kiểm thử flow hệ thống và tích hợp một số feature AI với Backend. |
| **Đậu Văn Nam - 2A202600033** | Backend & AI Engineer | Phụ trách thiết kế kiến trúc Backend bằng FastAPI, xây dựng Authentication & Authorization, database schema, Redis/RQ pipeline và AI processing flow. Phát triển các API xử lý video, transcript, mindmap, slide generation, flashcard và quiz generation. Thực hiện merge FE/BE, build Docker Backend, hỗ trợ deploy AWS Cloud, tối ưu queue service, viết tài liệu kỹ thuật (README, Architecture, Worklog) và triển khai testing bằng Pytest + SQLite in-memory. |

---

## 🔮 12. Hạn chế hiện tại & Hướng phát triển tương lai

### Hạn chế hiện tại:
*   **Giới hạn từ điển của Avatar VSL:** Mô hình Avatar VSL (Ngôn ngữ ký hiệu) hiện tại hoạt động dựa trên thư viện từ điển dựng sẵn, chưa hỗ trợ sinh chuyển động tự do (generative gestures) thời gian thực từ câu văn có ngữ pháp phức tạp hoặc từ lóng mới.
*   **Độ trễ xử lý (Cold-start Latency) video dài:** Khi xử lý các video bài giảng dung lượng lớn hoặc thời lượng dài (>30 phút), luồng công việc tuần tự ngầm (Whisper Transcribe -> GPT Analysis -> PPTX slides generation) có thể mất từ 1-3 phút để hoàn thành, tạo cảm giác chờ đợi cho người học trong lần đầu tiên upload.
*   **Nhạy cảm với nhiễu âm thanh đầu vào:** Chất lượng chuyển đổi giọng nói thành văn bản (Speech-to-Text) phụ thuộc lớn vào chất lượng âm thanh gốc. Hệ thống chưa tích hợp bộ lọc khử nhiễu tự động khi video đầu vào có tạp âm lớn hoặc có nhiều người nói chồng chéo.
*   **Phụ thuộc vào hạn ngạch (Rate Limit) và chi phí API:** Việc gọi liên tục các API của bên thứ ba (OpenAI Whisper & GPT-4o) gây tốn kém chi phí token vận hành và dễ chạm ngưỡng giới hạn băng thông (TPM/RPM) khi có số lượng lớn sinh viên truy cập cùng lúc.

### Hướng phát triển:
*   **Tích hợp Generative VSL Avatar:** Nghiên cứu ứng dụng các mô hình học sâu sinh chuyển động hình thể và khuôn mặt (như Diffusion Models, GANs) để sinh trực tiếp video người ảo ngôn ngữ ký hiệu tự nhiên từ bất kỳ đoạn văn bản tiếng Việt nào.
*   **Tối ưu hóa âm thanh (Audio Pre-processing Filter):** Tích hợp tầng tiền xử lý âm thanh dùng thuật toán khử nhiễu (Audio Noise Reduction) và phân tách giọng nói (Speaker Diarization) trước khi đưa vào pipeline Whisper nhằm tối đa hóa độ chính xác phụ đề.
*   **Chuyển đổi sang WebSockets Push-state:** Thay thế cơ chế Polling HTTP (`/status` endpoint) hiện tại bằng kết nối WebSockets thời gian thực để cập nhật phần trăm tiến độ xử lý video bài giảng (e.g., 20%, 50%, 80%) mượt mà hơn lên giao diện.
*   **Bộ nhớ đệm thông minh & Tìm kiếm ngữ nghĩa (Semantic Search):** Áp dụng Redis Caching cho các cụm từ/slide phổ biến và tích hợp Vector Database (như pgvector) hỗ trợ học sinh tìm kiếm ngữ nghĩa trực tiếp trên kho dữ liệu transcript bài giảng toàn hệ thống.
*   **Hỗ trợ Offline Mode:** Cho phép đóng gói toàn bộ gói tài nguyên bài học (video phụ đề nén, sơ đồ tư duy dạng ảnh, slide PowerPoint và bộ quiz offline) để học sinh khiếm thính có thể tải về và tự học khi không có kết nối internet.
