import asyncio
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from sqlalchemy import delete
from sqlmodel import Session
from sqlmodel import select

from ..database import engine
from ..models import Flashcard, Lesson, ContentMetadata, Category, Course, Module, Quiz, Question, QuestionOption, QuizAttempt, UserFlashcardProgress
from .ai_service import AIService
from .artifact_service import build_ai_analysis
from .job_service import upsert_job_status
from .video_service import VideoService

logger = logging.getLogger(__name__)

executor = ThreadPoolExecutor(max_workers=2)

def _run_transcription_sync(audio_path: Path, lesson_id: str):
    return AIService.transcribe(audio_path, lesson_id)


async def _run_artifact_task(name: str, coro):
    try:
        return await coro, None
    except Exception as exc:
        logger.exception("Artifact generation failed: %s", name)
        return None, str(exc)

async def run_video_pipeline(lesson_id: str, video_path: Path | str):
    video_path = Path(video_path)
    lesson_uuid = uuid.UUID(str(lesson_id))
    try:
        with Session(engine) as session:
            def update_status(new_status: str):
                lesson = session.get(Lesson, lesson_uuid)
                if lesson:
                    lesson.status = new_status
                    session.add(lesson)
                    session.commit()
                progress_map = {
                    "queued": 0,
                    "downloading": 5,
                    "extracting_audio": 20,
                    "transcribing": 50,
                    "translating": 65,
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
            source_language = AIService.normalize_caption_language(original_transcript.get("language"))
            original_transcript["language"] = source_language
            update_status("translating")
            target_language = "en" if source_language == "vi" else "vi"
            translated_transcript = await AIService.translate_transcript_to_language_json(
                original_transcript, target_language
            )
            stored_transcript = AIService.build_bilingual_transcript(
                source_transcript=original_transcript,
                translated_transcript=translated_transcript,
                translation_error=None if translated_transcript else f"Khong the dich transcript sang {target_language}.",
            )
            vi_transcript = (
                {"video_id": original_transcript.get("video_id"), "language": "vi", "segments": stored_transcript["segments_by_language"]["vi"]}
                if "vi" in stored_transcript.get("segments_by_language", {})
                else original_transcript
            )

            update_status("ai_processing")
            artifact_results = await asyncio.gather(
                _run_artifact_task("summary", AIService.summarize(vi_transcript)),
                _run_artifact_task("metadata", AIService.process_all_lecture_metadata(vi_transcript)),
                _run_artifact_task("briefing", AIService.generate_pre_lecture_briefing(vi_transcript)),
                _run_artifact_task("notebook_data", AIService.generate_notebook_data(vi_transcript)),
                _run_artifact_task("handsign_data", AIService.generate_handsign_data(vi_transcript)),
                _run_artifact_task("quizzes", AIService.generate_persistent_quizzes(vi_transcript)),
            )
            artifact_names = ["summary", "metadata", "briefing", "notebook_data", "handsign_data", "quizzes"]
            artifact_values = dict(zip(artifact_names, [result for result, _ in artifact_results]))
            artifact_errors = dict(zip(artifact_names, [error for _, error in artifact_results]))
            for artifact_name, artifact_value in artifact_values.items():
                if isinstance(artifact_value, dict) and artifact_value.get("error") and not artifact_errors.get(artifact_name):
                    artifact_errors[artifact_name] = str(artifact_value.get("error"))
            summary = artifact_values.get("summary") or []
            metadata = artifact_values.get("metadata") or {}
            briefing = artifact_values.get("briefing") or {}
            notebook_data = artifact_values.get("notebook_data") or {}
            handsign_data = artifact_values.get("handsign_data") or []
            persistent_quizzes = artifact_values.get("quizzes") or []

            # Auto-Categorization logic
            categories = session.exec(select(Category)).all()
            cat_names = [c.name for c in categories]
            best_cat_name = await AIService.identify_category(summary, cat_names)
            
            # Find or Create Course/Module if lesson is loose
            lesson = session.get(Lesson, lesson_uuid)
            if lesson and (lesson.duration_minutes or 0) <= 0:
                duration_seconds = VideoService.get_video_duration_seconds(video_path)
                if duration_seconds:
                    lesson.duration_minutes = max(1, int(round(duration_seconds / 60)))
            if lesson and not lesson.module_id:
                # Assign to a default "AI Auto-Generated" course in that category
                target_cat = next((c for c in categories if c.name == best_cat_name), categories[0] if categories else None)
                if target_cat:
                    course = session.exec(select(Course).where(Course.category_id == target_cat.id)).first()
                    if not course:
                        course = Course(title=f"Khóa học {target_cat.name}", category_id=target_cat.id, instructor_id=None)
                        session.add(course)
                        session.commit()
                        session.refresh(course)
                    
                    module = session.exec(select(Module).where(Module.course_id == course.id)).first()
                    if not module:
                        module = Module(title="Chương 1: Khởi đầu", course_id=course.id)
                        session.add(module)
                        session.commit()
                        session.refresh(module)
                    
                    lesson.module_id = module.id
                    session.add(lesson)

            ai_analysis = build_ai_analysis(
                transcript=stored_transcript,
                summary=summary,
                metadata=metadata,
                briefing=briefing,
                notebook_data=notebook_data,
                handsign_data=handsign_data,
                quizzes=persistent_quizzes,
                errors=artifact_errors,
            )

            content_entry = session.exec(
                select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)
            ).first()
            if content_entry:
                content_entry.video_url = str(video_path)
                content_entry.ai_analysis = ai_analysis
            else:
                content_entry = ContentMetadata(
                    lesson_id=lesson_uuid,
                    video_url=str(video_path),
                    ai_analysis=ai_analysis
                )
            session.add(content_entry)

            old_flashcards = session.exec(select(Flashcard).where(Flashcard.lesson_id == lesson_uuid)).all()
            for old_flashcard in old_flashcards:
                session.exec(delete(UserFlashcardProgress).where(UserFlashcardProgress.flashcard_id == old_flashcard.id))
            session.exec(delete(Flashcard).where(Flashcard.lesson_id == lesson_uuid))
            for fc in ai_analysis.get("flashcards", []):
                session.add(
                    Flashcard(
                        lesson_id=lesson_uuid,
                        front=fc.get("front"),
                        back=fc.get("back"),
                    )
                )

            # Save persistent Quizzes
            if ai_analysis.get("quizzes"):
                old_quizzes = session.exec(select(Quiz).where(Quiz.lesson_id == lesson_uuid)).all()
                for old_quiz in old_quizzes:
                    old_questions = session.exec(select(Question).where(Question.quiz_id == old_quiz.id)).all()
                    for old_question in old_questions:
                        session.exec(delete(QuestionOption).where(QuestionOption.question_id == old_question.id))
                    session.exec(delete(Question).where(Question.quiz_id == old_quiz.id))
                    session.exec(delete(QuizAttempt).where(QuizAttempt.quiz_id == old_quiz.id))
                session.exec(delete(Quiz).where(Quiz.lesson_id == lesson_uuid))

                quiz = Quiz(title=f"Quiz: {lesson.title}", lesson_id=lesson_uuid)
                session.add(quiz)
                session.commit()
                session.refresh(quiz)
                
                for q_data in ai_analysis.get("quizzes", []):
                    question = Question(
                        quiz_id=quiz.id,
                        question_text=q_data["question_text"],
                        explanation=q_data["explanation"],
                        difficulty=q_data["difficulty"]
                    )
                    session.add(question)
                    session.commit()
                    session.refresh(question)
                    
                    for key, val in q_data["options"].items():
                        option = QuestionOption(
                            question_id=question.id,
                            option_text=val,
                            is_correct=(key == q_data["correct_answer"])
                        )
                        session.add(option)
            session.commit()
            update_status("completed")
    except Exception as e:
        with Session(engine) as session:
            lesson = session.get(Lesson, lesson_uuid)
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
