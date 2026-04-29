import os
import sys
# Thêm thư mục gốc của dự án vào sys.path để Python nhận diện được module 'src'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import uuid
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from src.backend.services.file_service import FileService
from src.backend.services.tts_service import TTSService

# Cấu hình Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="A20 Document-to-Audio API")

# Cấu hình CORS cho phép Frontend gọi tới
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế nên giới hạn lại ví dụ: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/api/convert")
async def convert_file_to_audio(file: UploadFile = File(...)):
    """
    Pipeline chính:
    1. Nhận file PDF/DOCX.
    2. Trích xuất text (Ưu tiên Chandra API -> Local OCR -> PyMuPDF).
    3. Chuyển text sang Audio (MP3).
    4. Trả về file MP3.
    """
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    input_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")
    output_audio_path = os.path.join(TEMP_DIR, f"{file_id}.mp3")

    try:
        # Lưu file upload tạm thời
        logger.info(f"📥 Đang nhận file: {file.filename}")
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Bước 1: Trích xuất văn bản
        logger.info(f"🔍 Đang trích xuất văn bản...")
        text = FileService.extract_text(input_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Không thể trích xuất văn bản từ tệp này.")

        # Bước 2: Chuyển đổi sang âm thanh
        logger.info(f"🔊 Đang chuyển đổi sang âm thanh...")
        await TTSService.generate_audio(text, output_audio_path)

        # Trả về file MP3 và cấu hình xóa file sau khi gửi xong (để tiết kiệm bộ nhớ)
        return FileResponse(
            path=output_audio_path, 
            filename=f"{os.path.splitext(file.filename)[0]}.mp3",
            media_type="audio/mpeg"
        )

    except Exception as e:
        logger.error(f"❌ Lỗi Pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Dọn dẹp file đầu vào ngay lập tức
        if os.path.exists(input_path):
            os.remove(input_path)

@app.on_event("startup")
def startup_event():
    logger.info("🚀 Server A20 Backend đang khởi động...")
    os.makedirs(TEMP_DIR, exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
