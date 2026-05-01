# 📘 A20-App-075 — Tài Liệu Dự Án

> **Dự án:** AI Accessibility Tool cho người khiếm thị tại Việt Nam  
> **Repository:** `a20-ai-thuc-chien/A20-App-075`  
> **Branch chính:** `main` | **Branch phát triển:** `feature/Data`  
> **Cập nhật lần cuối:** 2026-04-14

---

## 📑 Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cài đặt & Khởi chạy](#3-cài-đặt--khởi-chạy)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Mô tả mã nguồn](#5-mô-tả-mã-nguồn)
6. [Công cụ (Tools)](#6-công-cụ-tools)
7. [Cấu hình môi trường](#7-cấu-hình-môi-trường)
8. [AI Logging & Hooks](#8-ai-logging--hooks)
9. [Quy trình đóng góp (Git Workflow)](#9-quy-trình-đóng-góp-git-workflow)
10. [Tài liệu sản phẩm](#10-tài-liệu-sản-phẩm)
11. [Trạng thái dự án](#11-trạng-thái-dự-án)

---

## 1. Tổng Quan Dự Án

**A20-App-075** là một AI Agent được xây dựng với mục tiêu giải quyết vấn đề **tiếp cận thông tin cho người khiếm thị và thị giác yếu tại Việt Nam**.

### 🎯 Mục tiêu

- Xây dựng công cụ AI có khả năng đọc và mô tả tài liệu (PDF ảnh, slide, biểu đồ) bằng tiếng Việt
- Cung cấp giải pháp TTS/STT chất lượng cao cho tiếng Việt
- Tích hợp với các nền tảng học tập phổ biến (LMS, Zoom, Teams)
- Miễn phí hoàn toàn cho người dùng khiếm thị

### 👥 Người dùng mục tiêu

| Persona | Mô tả | Pain Point chính |
|---|---|---|
| **Minh, 21t – Sinh viên** | Mù bẩm sinh, dùng NVDA hàng ngày | PDF bài giảng không có text layer, LMS bị lỗi focus |
| **Lan, 35t – Nhân viên văn phòng** | Thị lực 10%, dùng TTS + phóng to màn hình | TTS tiếng Việt kém chất lượng, không có caption meeting |

### 🏆 Điểm khác biệt

1. 🇻🇳 TTS & STT tiếng Việt bản địa hóa hoàn toàn
2. 📄 OCR thông minh cho tài liệu giáo dục Việt Nam (PDF ảnh, slide)
3. 🆓 Freemium thực sự — core features miễn phí cho người khiếm thị
4. 🔌 Plugin tích hợp LMS (Moodle, Google Classroom, Canvas)
5. 💬 Captioning thời gian thực bằng tiếng Việt

---

## 2. Cấu Trúc Thư Mục

```
A20-App-075/
├── src/                        # Mã nguồn chính
│   ├── __init__.py
│   ├── agent.py                # Vòng lặp agent chính (Claude API)
│   ├── tools.py                # Định nghĩa và đăng ký các công cụ
│   └── config.py               # Cấu hình từ biến môi trường
│
├── scripts/                    # Tiện ích & tự động hóa
│   ├── setup_hooks.sh          # Cài đặt Git pre-push hook (chạy 1 lần)
│   ├── log_hook.py             # Xử lý hook ghi log từ AI tools
│   └── submit_log.py           # Gửi log khi git push
│
├── docs/                       # Tài liệu nghiên cứu & kế hoạch
│   └── week-01-brief.md        # Product brief tuần 1 (Research & Discovery)
│
├── .ai-log/                    # Log tự động từ AI tools (gitignored)
│   └── session.jsonl           # Dữ liệu log theo định dạng JSONL
│
├── .agents/                    # Cấu hình cho các AI agent tools
├── .claude/                    # Cấu hình Claude Code
├── .cursor/                    # Cấu hình Cursor hooks
├── .codex/                     # Cấu hình OpenAI Codex hooks
├── .gemini/                    # Cấu hình Gemini CLI hooks
├── .github/                    # GitHub Actions & hooks
│
├── venv/                       # Virtual environment Python (gitignored)
├── requirements.txt            # Các thư viện Python cần thiết
├── .env.example                # Mẫu file cấu hình môi trường
├── .gitignore
├── AGENTS.md                   # Quy tắc cho AI coding agents
├── JOURNAL.md                  # Nhật ký hành trình xây dựng sản phẩm
├── WORKLOG.md                  # Quyết định kỹ thuật & phân công
├── README.md                   # Hướng dẫn tổng quan dự án
└── doc.md                      # Tài liệu kỹ thuật chi tiết (file này)
```

---

## 3. Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống

- Python **3.10+**
- Git
- Bash (Git Bash trên Windows, hoặc WSL)

### Bước 1 — Clone & cài hook

```bash
git clone https://github.com/a20-ai-thuc-chien/A20-App-075.git
cd A20-App-075

# Cài đặt Git pre-push hook (bắt buộc, chỉ chạy 1 lần)
bash scripts/setup_hooks.sh
```

### Bước 2 — Cấu hình môi trường

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị cần thiết:

```env
ANTHROPIC_API_KEY=sk-ant-...   # Bắt buộc — lấy từ console.anthropic.com
OPENAI_API_KEY=sk-...          # Tùy chọn — lấy từ platform.openai.com
DEFAULT_MODEL=claude-sonnet-4-20250514
LOG_LEVEL=INFO
AI_LOG_SERVER=...              # Pre-filled từ .env.example
AI_LOG_API_KEY=...             # Pre-filled từ .env.example
```

### Bước 3 — Tạo môi trường ảo & cài thư viện

```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt (Linux/Mac)
source venv/bin/activate

# Kích hoạt (Windows PowerShell)
venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### Bước 4 — Chạy agent

```bash
python -m src.agent
```

Gõ câu hỏi và nhấn Enter. Gõ `quit` hoặc `exit` hoặc `q` để thoát.

---

## 4. Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────┐
│                    USER INPUT                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  agent.py                           │
│                                                     │
│   ┌─────────────┐     ┌───────────────────────┐    │
│   │ SYSTEM      │     │   run_agent_loop()    │    │
│   │ PROMPT      │────▶│   (max 10 turns)      │    │
│   └─────────────┘     └───────┬───────────────┘    │
│                               │                     │
│              ┌────────────────┼────────────────┐    │
│              ▼                ▼                ▼    │
│        [end_turn]      [tool_use]         [error]   │
│              │                │                │    │
│              ▼                ▼                ▼    │
│        Return text     execute_tool()    Log & stop │
└─────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────┐
│                   tools.py                          │
│                                                     │
│   search_web(query)  →  placeholder search result  │
│   calculate(expr)    →  eval math expression        │
│   fetch_url(url)     →  HTTP GET (httpx, 2000 chars)│
└─────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────┐
│              Anthropic Claude API                   │
│         Model: claude-sonnet-4-20250514             │
│         Max tokens: 4096 per response               │
└─────────────────────────────────────────────────────┘
```

### Vòng lặp Agent (chi tiết)

```
User Input
    │
    ▼
messages = [{"role": "user", "content": input}]
    │
    ▼
FOR turn in range(max_turns=10):
    │
    ├─▶ client.messages.create(model, tools, messages)
    │         │
    │    stop_reason == "end_turn"?
    │         ├── YES → return final text ✅
    │         └── NO  → process tool_use blocks
    │                         │
    │                    execute_tool(name, args)
    │                         │
    │              messages.append(assistant + tool_results)
    │                         │
    │              Next turn ──────────────────────┐
    │                                              │
    └──────────────────────────────────────────────┘
    │
    ▼ (if max_turns reached)
"Agent reached maximum number of processing turns."
```

---

## 5. Mô Tả Mã Nguồn

### `src/config.py`

Tải biến môi trường từ file `.env` bằng `python-dotenv`.

| Biến | Mô tả | Mặc định |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key Anthropic Claude | `""` (bắt buộc điền) |
| `OPENAI_API_KEY` | API key OpenAI (dự phòng) | `""` |
| `DEFAULT_MODEL` | Model Claude sử dụng | `claude-sonnet-4-20250514` |
| `LOG_LEVEL` | Mức độ log (`DEBUG`, `INFO`, `WARNING`) | `INFO` |

### `src/agent.py`

Module chính chứa vòng lặp agent.

| Hàm | Mô tả |
|---|---|
| `create_agent()` | Khởi tạo Anthropic client, kiểm tra API key |
| `run_agent_loop(client, user_input, max_turns)` | Chạy vòng lặp agent, xử lý tool calls, trả kết quả cuối |
| `main()` | CLI interactive loop — đọc input từ terminal |

**System Prompt:**
```
You are an intelligent AI assistant.
You can use the provided tools to complete tasks.
Think step by step and use tools when necessary.
```

### `src/tools.py`

Định nghĩa và đăng ký các công cụ cho agent.

| Hàm | Mô tả |
|---|---|
| `get_tool_schemas()` | Trả về danh sách tool schema theo định dạng Anthropic API |
| `execute_tool(name, args)` | Thực thi tool theo tên, trả về kết quả dạng string |

---

## 6. Công Cụ (Tools)

### Tool hiện có

#### `search_web`
```python
search_web(query: str) -> str
```
- **Mô tả:** Tìm kiếm thông tin trên web *(hiện là placeholder)*
- **Input:** `query` — chuỗi tìm kiếm
- **Output:** Kết quả tìm kiếm (hiện trả về string mẫu)
- **TODO:** Tích hợp Brave Search API hoặc SerpAPI

#### `calculate`
```python
calculate(expression: str) -> str
```
- **Mô tả:** Tính toán biểu thức toán học
- **Input:** `expression` — biểu thức Python hợp lệ (VD: `"2 + 3 * 4"`)
- **Output:** Kết quả tính toán hoặc thông báo lỗi
- **Bảo mật:** Chạy trong sandbox `{"__builtins__": {}}` để ngăn code injection

#### `fetch_url`
```python
fetch_url(url: str) -> str
```
- **Mô tả:** Lấy nội dung từ một URL bằng HTTP GET
- **Input:** `url` — địa chỉ URL cần fetch
- **Output:** 2000 ký tự đầu của response body
- **Timeout:** 10 giây
- **Thư viện:** `httpx` với `follow_redirects=True`

### Thêm Tool mới

Để thêm tool mới, sửa file `src/tools.py`:

```python
# 1. Định nghĩa hàm
def my_new_tool(param1: str, param2: int) -> str:
    """Mô tả ngắn về tool."""
    # Logic của tool
    return "kết quả"

# 2. Đăng ký vào TOOLS dict
TOOLS = {
    # ... các tool hiện có ...
    "my_new_tool": {
        "fn": my_new_tool,
        "description": "Mô tả cho Claude hiểu khi nào dùng tool này",
        "parameters": {
            "param1": "string",
            "param2": "integer",
        },
    },
}
```

---

## 7. Cấu Hình Môi Trường

### File `.env.example`

```env
# === AI Model Keys ===
ANTHROPIC_API_KEY=           # Lấy tại: console.anthropic.com
OPENAI_API_KEY=              # Lấy tại: platform.openai.com

# === Model mặc định ===
DEFAULT_MODEL=claude-sonnet-4-20250514

# === Logging ===
LOG_LEVEL=INFO               # DEBUG | INFO | WARNING | ERROR

# === AI Activity Logging (pre-filled) ===
AI_LOG_SERVER=               # Server nhận log (có sẵn trong .env.example)
AI_LOG_API_KEY=              # API key gửi log (có sẵn trong .env.example)
```

> ⚠️ **Không bao giờ commit file `.env`**. File này đã được thêm vào `.gitignore`.

---

## 8. AI Logging & Hooks

Hệ thống tự động ghi lại tất cả tương tác với AI tools.

### Cách hoạt động

```
AI Tool (Claude Code / Cursor / Gemini / Codex / Copilot)
          │
          │ Hook trigger (pre-push / on-save)
          ▼
    scripts/log_hook.py
          │
          ▼
    .ai-log/session.jsonl  (local, gitignored)
          │
          │ git push
          ▼
    scripts/submit_log.py
          │
          ▼
    AI_LOG_SERVER  (remote logging server)
```

### Các file liên quan

| File | Mô tả |
|---|---|
| `scripts/setup_hooks.sh` | Cài đặt Git pre-push hook, chạy **1 lần duy nhất** |
| `scripts/log_hook.py` | Handler nhận sự kiện hook và ghi vào `session.jsonl` |
| `scripts/submit_log.py` | Gửi log lên server khi `git push` |
| `.ai-log/session.jsonl` | File log local theo định dạng JSONL |

### Cấu hình hook theo tool

| AI Tool | File cấu hình |
|---|---|
| Claude Code | `.claude/settings.json` |
| Cursor | `.cursor/hooks.json` |
| OpenAI Codex | `.codex/hooks.json` |
| Gemini CLI | `.gemini/settings.json` |
| GitHub Copilot | `.github/hooks/hooks.json` |

### Gửi log thủ công (nếu cần)

```bash
# Cú pháp hook thủ công
echo '{"hook_event_name": "Notification", "prompt": "Tóm tắt prompt...", "response_summary": "Tóm tắt response..."}' \
  | AI_TOOL_NAME=antigravity python3 scripts/log_hook.py
```

---

## 9. Quy Trình Đóng Góp (Git Workflow)

### Nhánh làm việc

| Nhánh | Mục đích |
|---|---|
| `main` | Branch ổn định, đã được review |
| `feature/Data` | Branch phát triển hiện tại |

### Quy trình chuẩn

```bash
# 1. Đồng bộ với main
git checkout main
git pull origin main

# 2. Tạo nhánh feature mới
git checkout -b feature/ten-tinh-nang

# 3. Làm việc, commit thường xuyên
git add .
git commit -m "mô tả ngắn gọn"

# 4. Push và tạo Pull Request
git push origin feature/ten-tinh-nang
```

### Yêu cầu Pull Request

Mỗi PR **bắt buộc** phải có:

```markdown
## Summary
<Mô tả những gì đã thay đổi và tại sao>

## Changes
- src/agent.py — thêm retry logic cho tool errors
- docs/week-02-brief.md — cập nhật product brief tuần 2
```

> ⚠️ **Không tạo PR** nếu chưa chạy `bash scripts/setup_hooks.sh`

### Quy tắc commit message

```
feat: thêm tính năng mới
fix: sửa bug
docs: cập nhật tài liệu
refactor: tái cấu trúc code
test: thêm/sửa tests
chore: công việc bảo trì
```

---

## 10. Tài Liệu Sản Phẩm

### Tài liệu sẵn có

| Tài liệu | Đường dẫn | Mô tả |
|---|---|---|
| Product Brief Tuần 1 | [`docs/week-01-brief.md`](./docs/week-01-brief.md) | Persona, Problem Statement, Competitor Analysis, USP |
| Nhật ký hành trình | [`JOURNAL.md`](./JOURNAL.md) | Cập nhật cuối mỗi tuần — những gì đã làm, học được |
| Worklog kỹ thuật | [`WORKLOG.md`](./WORKLOG.md) | ADR, phân công sprint, brainstorming, bug report |
| Quy tắc AI Agent | [`AGENTS.md`](./AGENTS.md) | Hướng dẫn dùng AI tools trong project |

### Lịch cập nhật tài liệu

| Tài liệu | Khi nào cập nhật |
|---|---|
| `JOURNAL.md` | Cuối mỗi tuần, **bắt buộc trước khi tạo PR** |
| `WORKLOG.md` | Khi có quyết định kỹ thuật mới, phân công task, hoặc fix bug quan trọng |
| `docs/week-XX-brief.md` | Đầu mỗi tuần, sau khi hoàn thành research |

---

## 11. Trạng Thái Dự Án

### Phase hiện tại: **Week 01 — Research & Discovery** ✅

| Task | Trạng thái | Ngày |
|---|---|---|
| Nghiên cứu đối thủ cạnh tranh | ✅ Hoàn thành | 2026-04-14 |
| Xây dựng User Persona | ✅ Hoàn thành | 2026-04-14 |
| Viết Problem Statement | ✅ Hoàn thành | 2026-04-14 |
| Xác định USP | ✅ Hoàn thành | 2026-04-14 |
| Product Brief tuần 1 | ✅ Hoàn thành | 2026-04-14 |

### Kế hoạch: **Week 02 — Tech Stack & Data**

| Task | Trạng thái | Phụ trách |
|---|---|---|
| Phỏng vấn 2–3 sinh viên khiếm thị | ⏳ Chờ | — |
| Chọn ASR/TTS engine tiếng Việt (Whisper, PhoWhisper, Zalo AI…) | ⏳ Chờ | — |
| Benchmark OCR pipeline (Tesseract+VietOCR vs cloud API) | ⏳ Chờ | — |
| Thu thập 10–20 PDF bài giảng thực tế | ⏳ Chờ | — |
| Xác định metrics WER/MOS | ⏳ Chờ | — |

---

### Dependencies hiện tại

```
anthropic>=0.40.0       # Claude API client
openai>=1.50.0          # OpenAI API client (dự phòng)
python-dotenv>=1.0.0    # Đọc file .env
httpx>=0.27.0           # HTTP client bất đồng bộ
pydantic>=2.0.0         # Data validation
```

---

*📝 Document maintained by: A20-App-075 Team | Version: v1.0 | 2026-04-14*
