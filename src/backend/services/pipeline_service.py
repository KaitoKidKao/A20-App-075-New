import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from sqlmodel import Session

from src.backend.database import engine
from src.backend.models import Flashcard, LectureData, Video
from src.backend.services.ai_service import AIService
from src.backend.services.job_service import upsert_job_status
from src.backend.services.video_service import VideoService

logger = logging.getLogger(__name__)

executor = ThreadPoolExecutor(max_workers=2)


def _run_transcription_sync(audio_path: Path, video_id: str):
    return AIService.transcribe(audio_path, video_id)


async def run_video_pipeline(video_id: str, video_path: Path | str):
    video_path = Path(video_path)
    try:
        with Session(engine) as session:
            def update_status(new_status: str):
                video = session.get(Video, video_id)
                if video:
                    video.status = new_status
                    session.add(video)
                    session.commit()
                progress_map = {
                    "queued": 0,
                    "downloading": 5,
                    "extracting_audio": 20,
                    "transcribing": 50,
                    "ai_processing": 80,
                    "completed": 100,
                }
                upsert_job_status(
                    session,
                    video_id=video_id,
                    status=new_status,
                    progress=progress_map.get(new_status, 0),
                )

            update_status("extracting_audio")
            audio_path = VideoService.extract_audio(video_path)

            update_status("transcribing")
            loop = asyncio.get_event_loop()
            transcript_data = await loop.run_in_executor(
                executor, _run_transcription_sync, audio_path, video_id
            )

            if transcript_data.get("language") != "vi":
                transcript_data = await AIService.translate_transcript_to_vi(transcript_data)

            update_status("ai_processing")
            summary, metadata, briefing, notebook_data, handsign_data = await asyncio.gather(
                AIService.summarize(transcript_data),
                AIService.process_all_lecture_metadata(transcript_data),
                AIService.generate_pre_lecture_briefing(transcript_data),
                AIService.generate_notebook_data(transcript_data),
                AIService.generate_handsign_data(transcript_data),
            )

            lecture_entry = LectureData(
                video_id=video_id,
                transcript=transcript_data,
                summary=summary,
                timeline=metadata.get("timeline"),
                highlights=metadata.get("highlights"),
                questions=metadata.get("questions"),
                briefing=briefing,
                visual_data=notebook_data.get("visual_data"),
                cover_image_url=notebook_data.get("cover_image_url"),
                handsign_data=handsign_data,
            )
            session.add(lecture_entry)

            for fc in notebook_data.get("flashcards", []):
                session.add(
                    Flashcard(
                        video_id=video_id,
                        front=fc.get("front"),
                        back=fc.get("back"),
                    )
                )
            session.commit()
            update_status("completed")
    except Exception as e:
        with Session(engine) as session:
            video = session.get(Video, video_id)
            if video:
                video.status = f"failed: {str(e)}"
                session.add(video)
                session.commit()
            upsert_job_status(
                session,
                video_id=video_id,
                status="failed",
                progress=100,
                error_message=str(e),
            )
        logger.error("Pipeline failed for %s: %s", video_id, e)


def run_video_pipeline_sync(video_id: str, video_path: str):
    asyncio.run(run_video_pipeline(video_id, Path(video_path)))


def shutdown_pipeline_executor():
    executor.shutdown(wait=True)
