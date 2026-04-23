# AI20K-200 · Audio-First Accessibility Agent

Dự án hỗ trợ sinh viên khiếm thị và giảng viên tiếp cận tài liệu học thuật thông qua âm thanh có cấu trúc, sử dụng các mô hình AI OCR hiện đại.

## 🏗 Cấu trúc dự án

```text
├── src/
│   ├── backend/            # Python/FastAPI Backend
│   │   ├── agent.py        # Logic Agent (OpenAI gpt-4o-mini)
│   │   ├── tools.py        # Công cụ trích xuất (OCR Chandra/Hunyuan)
│   │   └── config.py       # Quản lý cấu hình
│   └── frontend/           # Next.js/React Frontend
├── tests/                  # Kịch bản kiểm thử (Extraction, API...)
├── data/                   # Tài liệu mẫu (PDF, DOCX)
├── requirements.txt        # Dependencies của Backend
├── .env.example            # Template cấu hình môi trường
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### 1. Tiền đề (Prerequisites)
- **Python 3.10+**
- **Node.js 18+**
- **uv** (Công cụ quản lý Python package siêu tốc):
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

### 2. Cài đặt Backend
Di chuyển vào thư mục gốc và thực hiện:

```bash
# Tạo môi trường ảo
uv venv
source .venv/bin/activate  # Linux/macOS
# .\.venv\Scripts\activate  # Windows

# Cài đặt thư viện
uv pip install -r requirements.txt
```

### 3. Cài đặt Frontend
Di chuyển vào thư mục frontend:

```bash
cd src/frontend
npm install
```

### 4. Cấu hình môi trường
Copy file mẫu và điền các API Key của bạn:

```bash
cp .env.example .env
```

Các biến quan trọng:
- `OPENAI_API_KEY`: Dùng cho Agent (gpt-4o-mini).
- `CHANDRA_API_KEY`: Dùng cho luồng trích xuất chính (OCR API).

## 🛠 Cách chạy dự án

### Chạy Backend Agent (Terminal mode)
```bash
python -m src.backend.agent
```

### Chạy Frontend (Development mode)
```bash
cd src/frontend
npm run dev
```

### Chạy bộ kiểm thử trích xuất (OCR & Fallback)
```bash
python tests/test_extraction.py
```

## 📖 Chiến lược trích xuất dữ liệu (PDF/DOCX)
Dự án áp dụng quy trình trích xuất thông minh để tối ưu hiệu suất và độ chính xác:
1.  **Luồng chính**: Sử dụng **Chandra OCR API** để xử lý các tài liệu phức tạp.
2.  **Luồng Local**: Hỗ trợ chạy model **Chandra-OCR-2** hoặc **HunyuanOCR** trực tiếp từ HuggingFace.
3.  **Dự phòng (Fallback)**: Tự động sử dụng **PyMuPDF** để lấy text gốc nếu OCR gặp lỗi hoặc không cần thiết.

## 🤝 Quy tắc đóng góp
- Luôn cập nhật **JOURNAL.md** sau mỗi tuần làm việc.
- Các quyết định kỹ thuật quan trọng cần ghi vào **WORKLOG.md**.
- Tuân thủ quy tắc Agent trong **AGENTS.md**.

---
*Dự án thuộc chương trình đào tạo AI20K-200.*
