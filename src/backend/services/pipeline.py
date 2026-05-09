import asyncio
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from sqlmodel import Session
from src.backend.database import engine
from src.backend.models import Video, LectureData
from src.backend.services.video_service import VideoService
from src.backend.services.ai_service import AIService

logger = logging.getLogger(__name__)

# Thư mục lưu trữ trạng thái đơn giản (In-memory) - Tương thích ngược
processing_status = {}

# Executor để chạy các tác vụ đồng bộ (Whisper)
executor = ThreadPoolExecutor(max_workers=2)

def run_transcription_sync(audio_path: Path, video_id: str):
    """Hàm chạy Whisper (đồng bộ) trong thread riêng"""
    return AIService.transcribe(audio_path, video_id)

async def run_video_pipeline(video_id: str, video_path: Path):
    """
    Pipeline xử lý video: Tách audio -> Transcribe -> AI Summary & Metadata -> Lưu DB
    """
    try:
        with Session(engine) as session:
            # Helper để cập nhật trạng thái video
            def update_status(new_status: str):
                video = session.get(Video, video_id)
                if video:
                    video.status = new_status
                    session.add(video)
                    session.commit()
                processing_status[video_id] = new_status

            # Bước 1: Tách âm thanh
            update_status("extracting_audio")
            logger.info(f"🎬 [{video_id}] Đang tách âm thanh...")
            audio_path = VideoService.extract_audio(video_path)
            
            # Bước 2: Nhận diện tiếng nói (Whisper)
            update_status("transcribing")
            logger.info(f"🎙️ [{video_id}] Đang nhận diện tiếng nói (Whisper CPU)...")
            
            loop = asyncio.get_event_loop()
            transcript_data = await loop.run_in_executor(executor, run_transcription_sync, audio_path, video_id)
            
            # Bước 3: Phân tích AI (Summary, Timeline, Highlights, etc.)
            update_status("ai_processing")
            logger.info(f"🧠 [{video_id}] Đang phân tích AI (Batching)...")
            
            # Gọi gộp các tính năng AI (Cốt lõi)
            summary = await AIService.summarize(transcript_data)
            metadata = await AIService.process_all_lecture_metadata(transcript_data)
            briefing = await AIService.generate_pre_lecture_briefing(transcript_data)
            
            # Bước 4: Lưu kết quả vào DB (Chưa bao gồm Mindmap/Quiz/Slides - sẽ xử lý On-demand)
            logger.info(f"💾 [{video_id}] Đang lưu kết quả vào bảng lecture_data...")
            lecture_entry = LectureData(
                video_id=video_id,
                transcript=transcript_data,
                summary=summary,
                timeline=metadata.get("timeline"),
                highlights=metadata.get("highlights"),
                questions=metadata.get("questions"),
                briefing=briefing,
                mindmap=None,
                quiz=None,
                slides=None
            )
            session.add(lecture_entry)
            
            update_status("completed")
            logger.info(f"✅ [{video_id}] Hoàn thành toàn bộ pipeline.")
            
    except Exception as e:
        with Session(engine) as session:
            video = session.get(Video, video_id)
            if video:
                video.status = f"failed: {str(e)}"
                session.add(video)
                session.commit()
        processing_status[video_id] = f"failed: {str(e)}"
        logger.error(f"❌ [{video_id}] Lỗi pipeline: {e}")

async def download_and_run_pipeline(vid: str, vurl: str):
    """
    Wrapper để tải video từ URL rồi mới chạy pipeline.
    """
    try:
        # Cập nhật trạng thái record ban đầu
        with Session(engine) as sub_session:
            video = sub_session.get(Video, vid)
            if video:
                video.status = "downloading"
                sub_session.add(video)
                sub_session.commit()
        
        processing_status[vid] = "downloading"
        vpath = await VideoService.download_video(vurl, vid)
        
        # Cập nhật path sau khi tải xong
        with Session(engine) as sub_session:
            video = sub_session.get(Video, vid)
            if video:
                video.storage_path = str(vpath)
                sub_session.add(video)
                sub_session.commit()

        await run_video_pipeline(vid, vpath)
    except Exception as e:
        with Session(engine) as sub_session:
            video = sub_session.get(Video, vid)
            if video:
                video.status = f"failed_download: {str(e)}"
                sub_session.add(video)
                sub_session.commit()
        processing_status[vid] = f"failed_download: {str(e)}"
        logger.error(f"❌ Lỗi tải video {vid}: {e}")
