import os
import sys
# Thêm thư mục gốc vào sys.path để nhận diện module 'src'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import uuid
import logging
import asyncio
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from src.backend.services.video_service import VideoService
from src.backend.services.ai_service import AIService
from src.backend import config

# Cấu hình Logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="A20 Video Captioning & Summary API")

# Executor để chạy các tác vụ đồng bộ (Whisper) mà không làm nghẽn event loop
executor = ThreadPoolExecutor(max_workers=2)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thư mục lưu trữ trạng thái đơn giản (In-memory)
processing_status = {}

@app.on_event("shutdown")
def shutdown_event():
    logger.info("🛑 Đang dọn dẹp tài nguyên và tắt server...")
    executor.shutdown(wait=True)

def run_transcription_sync(audio_path: Path, video_id: str):
    """Hàm chạy Whisper (đồng bộ) trong thread riêng"""
    return AIService.transcribe(audio_path, video_id)

async def run_video_pipeline(video_id: str, video_path: Path):
    """
    Pipeline xử lý video: Tách audio (Subprocess) -> Transcribe (Whisper/Thread)
    """
    try:
        # Bước 1: Tách âm thanh
        processing_status[video_id] = "extracting_audio"
        logger.info(f"🎬 [{video_id}] Đang tách âm thanh...")
        audio_path = VideoService.extract_audio(video_path)
        
        # Bước 2: Nhận diện tiếng nói (Whisper - chạy trong ThreadPool để không block async)
        processing_status[video_id] = "transcribing"
        logger.info(f"🎙️ [{video_id}] Đang nhận diện tiếng nói (Whisper CPU)...")
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(executor, run_transcription_sync, audio_path, video_id)
        
        processing_status[video_id] = "completed"
        logger.info(f"✅ [{video_id}] Hoàn thành toàn bộ pipeline.")
        
    except Exception as e:
        processing_status[video_id] = f"failed: {str(e)}"
        logger.error(f"❌ [{video_id}] Lỗi pipeline: {e}")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Video Captioning API"}

@app.post("/api/videos/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Endpoint upload video: Lưu file và kích hoạt pipeline xử lý.
    """
    video_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".mov", ".avi", ".mkv"]:
        raise HTTPException(status_code=400, detail="Định dạng file không hỗ trợ.")
    
    filename = f"{video_id}{ext}"
    
    try:
        # Lưu file video
        content = await file.read()
        logger.info(f"📥 Đang nhận file: {file.filename} (ID: {video_id})")
        video_path = await VideoService.save_video(content, filename)
        
        # Đưa vào hàng chờ xử lý trong nền
        processing_status[video_id] = "queued"
        background_tasks.add_task(run_video_pipeline, video_id, video_path)
        
        return {
            "video_id": video_id,
            "status": "processing",
            "message": "Video đang được xử lý trong nền."
        }
    except Exception as e:
        logger.error(f"❌ Lỗi khi upload video {video_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/videos/process-url")
async def process_url(background_tasks: BackgroundTasks, data: dict):
    """
    Tiếp nhận URL video và xử lý trong nền.
    """
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp URL video.")
    
    video_id = str(uuid.uuid4())
    
    async def download_and_run_pipeline(vid: str, vurl: str):
        try:
            processing_status[vid] = "downloading"
            vpath = await VideoService.download_video(vurl, vid)
            await run_video_pipeline(vid, vpath)
        except Exception as e:
            processing_status[vid] = f"failed_download: {str(e)}"
            logger.error(f"❌ Lỗi khi tải video {vid}: {e}")

    # Đưa vào hàng chờ
    processing_status[video_id] = "queued"
    background_tasks.add_task(download_and_run_pipeline, video_id, url)
    
    return {
        "video_id": video_id,
        "status": "processing",
        "message": "URL đã được nhận và đang được tải xuống để xử lý."
    }

@app.get("/api/videos/{video_id}/status")
async def get_video_status(video_id: str):
    """Kiểm tra trạng thái xử lý của video"""
    status = processing_status.get(video_id, "not_found")
    return {"video_id": video_id, "status": status}

@app.get("/api/videos/{video_id}/transcript")
async def get_transcript(video_id: str):
    """Lấy kết quả phụ đề (Transcript)"""
    transcript_path = AIService.TRANSCRIPT_DIR / f"{video_id}.json"
    
    if not transcript_path.exists():
        status = processing_status.get(video_id, "not_found")
        return {
            "video_id": video_id, 
            "status": status, 
            "message": "Phụ đề chưa sẵn sàng hoặc không tồn tại."
        }
    
    with open(transcript_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/videos/{video_id}/summary")
async def get_summary(video_id: str):
    """Lấy tóm tắt nội dung dựa trên transcript đã có"""
    transcript_path = AIService.TRANSCRIPT_DIR / f"{video_id}.json"
    
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="Vui lòng đợi quá trình tạo phụ đề hoàn tất.")
    
    with open(transcript_path, "r", encoding="utf-8") as f:
        transcript_data = json.load(f)
    
    # Gọi service tóm tắt
    summary = await AIService.summarize(transcript_data)
    return {"video_id": video_id, "summary": summary}

if __name__ == "__main__":
    import uvicorn
    # Đảm bảo các thư mục tồn tại
    VideoService.ensure_dirs()
    AIService.TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
    
    logger.info("🚀 Starting A20 Backend Server on port 8000 with reload...")
    uvicorn.run("src.backend.main:app", host="0.0.0.0", port=8000, reload=True)
