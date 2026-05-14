import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from sqlmodel import Session

from src.backend.database import engine
from src.backend.models import Flashcard, Lesson, ContentMetadata
from src.backend.services.ai_service import AIService
from src.backend.services.job_service import upsert_job_status
from src.backend.services.video_service import VideoService

logger = logging.getLogger(__name__)

executor = ThreadPoolExecutor(max_workers=2)

def _run_transcription_sync(audio_path: Path, lesson_id: str):
    return AIService.transcribe(audio_path, lesson_id)

async def run_video_pipeline(lesson_id: str, video_path: Path | str):
    video_path = Path(video_path)
    try:
        with Session(engine) as session:
            def update_status(new_status: str):
                lesson = session.get(Lesson, lesson_id)
                if lesson:
                    lesson.status = new_status
                    session.add(lesson)
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
                    lesson_id=lesson_id,
                    status=new_status,
                    progress=progress_map.get(new_status, 0),
                )

            update_status("extracting_audio")
            audio_path = VideoService.extract_audio(video_path)

            update_status("transcribing")
            loop = asyncio.get_event_loop()
            transcript_data = await loop.run_in_executor(
                executor, _run_transcription_sync, audio_path, lesson_id
            )
            original_transcript = transcript_data
            source_language = (original_transcript.get("language") or "").lower()
            if source_language == "vi":
                vi_transcript = original_transcript
                en_transcript = await AIService.translate_transcript_to_language_json(
                    original_transcript, "en"
                )
            else:
                en_transcript = original_transcript if source_language == "en" else None
                vi_transcript = await AIService.translate_transcript_to_language_json(
                    original_transcript, "vi"
                )
                if en_transcript is None:
                    en_transcript = await AIService.translate_transcript_to_language_json(
                        vi_transcript, "en"
                    )

            stored_transcript = AIService.build_bilingual_transcript(
                original_transcript=en_transcript if (en_transcript and en_transcript.get("language") == "en") else original_transcript,
                vi_transcript=vi_transcript,
            )
            if isinstance(stored_transcript, dict):
                segments_by_language = stored_transcript.get("segments_by_language", {})
                if en_transcript and en_transcript.get("language") == "en":
                    segments_by_language["en"] = en_transcript.get("segments", [])
                if vi_transcript and vi_transcript.get("language") == "vi":
                    segments_by_language["vi"] = vi_transcript.get("segments", [])
                stored_transcript["segments_by_language"] = segments_by_language
                stored_transcript["available_languages"] = sorted(
                    [k for k, v in segments_by_language.items() if isinstance(v, list) and len(v) > 0]
                )
                stored_transcript["source_language"] = source_language or stored_transcript.get("source_language")

            update_status("ai_processing")
            summary, metadata, briefing, notebook_data, handsign_data = await asyncio.gather(
                AIService.summarize(vi_transcript),
                AIService.process_all_lecture_metadata(vi_transcript),
                AIService.generate_pre_lecture_briefing(vi_transcript),
                AIService.generate_notebook_data(vi_transcript),
                AIService.generate_handsign_data(vi_transcript),
            )

            # Build comprehensive AI analysis object
            ai_analysis = {
                "transcript": stored_transcript,
                "summary": summary,
                "timeline": metadata.get("timeline"),
                "highlights": metadata.get("highlights"),
                "questions": metadata.get("questions"),
                "briefing": briefing,
                "visual_data": notebook_data.get("visual_data"),
                "cover_image_url": notebook_data.get("cover_image_url"),
                "handsign_data": handsign_data,
            }

            content_entry = ContentMetadata(
                lesson_id=lesson_id,
                video_url=str(video_path),
                ai_analysis=ai_analysis
            )
            session.add(content_entry)

            for fc in notebook_data.get("flashcards", []):
                session.add(
                    Flashcard(
                        lesson_id=lesson_id,
                        front=fc.get("front"),
                        back=fc.get("back"),
                    )
                )
            session.commit()
            update_status("completed")
    except Exception as e:
        with Session(engine) as session:
            lesson = session.get(Lesson, lesson_id)
            if lesson:
                lesson.status = f"failed: {str(e)}"
                session.add(lesson)
                session.commit()
            upsert_job_status(
                session,
                lesson_id=lesson_id,
                status="failed",
                progress=100,
                error_message=str(e),
            )
        logger.error("Pipeline failed for %s: %s", lesson_id, e)

def run_video_pipeline_sync(lesson_id: str, video_path: str):
    asyncio.run(run_video_pipeline(lesson_id, Path(video_path)))

def shutdown_pipeline_executor():
    executor.shutdown(wait=True)
