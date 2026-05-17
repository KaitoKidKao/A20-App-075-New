import argparse
import sys
import uuid

from sqlmodel import Session, select

from src.backend.database import engine
from src.backend.models import ContentMetadata, Course, Lesson, Module
from src.backend.services.image_generation_service import ImageGenerationService


def _normalize_text(value: str | None) -> str:
    return (value or "").strip()


def _is_missing_cover(analysis: dict | None) -> bool:
    if not isinstance(analysis, dict):
        return True
    cover = _normalize_text(analysis.get("cover_image_url"))
    return not cover


def _extract_prompt(analysis: dict | None, lesson_title: str, course_title: str | None) -> str:
    if isinstance(analysis, dict):
        visual_data = analysis.get("visual_data")
        if isinstance(visual_data, dict):
            infographic = visual_data.get("infographic")
            if isinstance(infographic, dict):
                prompt = _normalize_text(infographic.get("image_prompt"))
                if prompt:
                    return prompt

    base_title = _normalize_text(lesson_title) or "educational lesson"
    course_part = _normalize_text(course_title)
    if course_part:
        return f"clean educational cover, {base_title}, {course_part}, modern classroom illustration"
    return f"clean educational cover, {base_title}, modern classroom illustration"


def _resolve_course_title(session: Session, lesson: Lesson | None) -> str | None:
    if not lesson:
        return None
    module = session.get(Module, lesson.module_id) if lesson.module_id else None
    if not module:
        return None
    course = session.get(Course, module.course_id) if module.course_id else None
    return course.title if course else None


def regenerate_covers(
    *,
    video_id: str | None,
    force: bool,
    limit: int | None,
    width: int,
    height: int,
    dry_run: bool,
) -> int:
    with Session(engine) as session:
        stmt = select(ContentMetadata)
        if video_id:
            try:
                lesson_uuid = uuid.UUID(video_id)
            except ValueError:
                print(f"Invalid --video-id: {video_id}", file=sys.stderr)
                return 1
            stmt = stmt.where(ContentMetadata.lesson_id == lesson_uuid)

        rows = list(session.exec(stmt).all())
        if not rows:
            print("No content_metadata rows found.")
            return 0

        updated = 0
        skipped = 0
        processed = 0

        for row in rows:
            if limit is not None and processed >= limit:
                break
            processed += 1

            analysis = row.ai_analysis if isinstance(row.ai_analysis, dict) else {}
            if not force and not _is_missing_cover(analysis):
                skipped += 1
                continue

            lesson = session.get(Lesson, row.lesson_id)
            lesson_title = lesson.title if lesson else str(row.lesson_id)
            course_title = _resolve_course_title(session, lesson)

            prompt = _extract_prompt(analysis, lesson_title, course_title)
            cover_url = ImageGenerationService.generate_cover_image_url(
                prompt,
                width=width,
                height=height,
            )
            if not cover_url:
                print(f"[SKIP] lesson_id={row.lesson_id} cannot generate image (all tokens/providers failed)")
                skipped += 1
                continue

            next_analysis = dict(analysis) if isinstance(analysis, dict) else {}
            next_analysis["cover_image_url"] = cover_url
            next_analysis["cover_image_prompt"] = prompt
            row.ai_analysis = next_analysis
            session.add(row)

            print(f"[OK] lesson_id={row.lesson_id} cover regenerated")
            print(f"     prompt={prompt}")
            print(f"     url={cover_url}")
            updated += 1

        if dry_run:
            session.rollback()
            print(f"\nDry-run complete. would_update={updated}, skipped={skipped}, processed={processed}")
        else:
            session.commit()
            print(f"\nDone. updated={updated}, skipped={skipped}, processed={processed}")

    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Regenerate cover_image_url for existing videos without re-uploading."
    )
    parser.add_argument("--video-id", help="Only process one lesson/video UUID")
    parser.add_argument("--force", action="store_true", help="Overwrite existing cover_image_url")
    parser.add_argument("--limit", type=int, help="Process at most N rows")
    parser.add_argument("--width", type=int, default=1024)
    parser.add_argument("--height", type=int, default=768)
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without committing")
    args = parser.parse_args()

    raise SystemExit(
        regenerate_covers(
            video_id=args.video_id,
            force=args.force,
            limit=args.limit,
            width=args.width,
            height=args.height,
            dry_run=args.dry_run,
        )
    )


if __name__ == "__main__":
    main()
