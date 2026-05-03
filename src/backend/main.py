import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Thêm thư mục gốc vào sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.backend import config
from src.backend.database import create_db_and_tables
from src.backend.services.video_service import VideoService
from src.backend.services.ai_service import AIService
from src.backend.routers import auth, videos

# Cấu hình Logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="A20 Video Captioning & Summary API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký Routers
app.include_router(auth.router)
app.include_router(videos.router)

@app.on_event("startup")
def on_startup():
    logger.info("🚀 Đang khởi tạo cơ sở dữ liệu...")
    create_db_and_tables()

@app.on_event("shutdown")
def shutdown_event():
    logger.info("🛑 Đang dọn dẹp tài nguyên và tắt server...")

@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "Video Captioning API"}

if __name__ == "__main__":
    import uvicorn
    # Đảm bảo các thư mục tồn tại
    VideoService.ensure_dirs()
    AIService.TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
    AIService.AI_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    
    logger.info("🚀 Starting A20 Backend Server on port 8000 with reload...")
    uvicorn.run("src.backend.main:app", host="0.0.0.0", port=8000, reload=True)
