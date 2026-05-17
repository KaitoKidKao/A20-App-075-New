"""
Sync existing cover images to S3.

For each video in the DB that has a local cover path (/uploads/covers/...):
  1. If S3 already has the file → skip.
  2. If the local file exists on disk → upload to S3.
  3. If neither (container restart wiped local file) → regenerate via OpenAI (requires --regenerate flag).

Usage:
  python -m src.backend.scripts.sync_covers_to_s3 [--regenerate] [--video-id UUID] [--dry-run]
"""
import argparse
import sys
import uuid
from pathlib import Path

from sqlmodel import Session, select

from src.backend import config
from src.backend.database import engine
from src.backend.models import ContentMetadata, Course, Lesson, Module
from src.backend.services.storage_service import s3_object_exists, upload_to_s3

UPLOADS_DIR = Path(config.UPLOADS_DIR)


def _local_path(cover_url: str) -> Path:
    # "/uploads/covers/abc.png" → data/uploads/covers/abc.png
    return UPLOADS_DIR / cover_url.lstrip("/").removeprefix("uploads/")


def _s3_key(cover_url: str) -> str:
    # "/uploads/covers/abc.png" → "uploads/covers/abc.png"
    return cover_url.lstrip("/")


def _resolve_course_title(session: Session, lesson: Lesson | None) -> str | None:
    if not lesson:
        return None
    module = session.get(Module, lesson.module_id) if lesson.module_id else None
    if not module:
        return None
    course = session.get(Course, module.course_id) if module.course_id else None
    return course.title if course else None


def run(*, video_id: str | None, regenerate: bool, dry_run: bool) -> int:
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

        already_in_s3 = 0
        uploaded = 0
        regenerated = 0
        skipped = 0

        for row in rows:
            analysis = row.ai_analysis if isinstance(row.ai_analysis, dict) else {}
            cover_url: str = (analysis.get("cover_image_url") or "").strip()

            if not cover_url.startswith("/uploads/covers/"):
                skipped += 1
                continue

            s3_key = _s3_key(cover_url)

            if s3_object_exists(s3_key):
                print(f"[S3]   lesson_id={row.lesson_id} already in S3, skipping")
                already_in_s3 += 1
                continue

            local = _local_path(cover_url)
            if local.exists():
                print(f"[UP]   lesson_id={row.lesson_id} uploading {local.name} → s3://{s3_key}")
                if not dry_run:
                    upload_to_s3(local, s3_key)
                uploaded += 1
                continue

            if not regenerate:
                print(f"[MISS] lesson_id={row.lesson_id} local file gone, pass --regenerate to fix")
                skipped += 1
                continue

            # Local file is gone and S3 has nothing → regenerate via OpenAI
            from src.backend.services.image_generation_service import ImageGenerationService

            lesson = session.get(Lesson, row.lesson_id)
            lesson_title = lesson.title if lesson else str(row.lesson_id)
            course_title = _resolve_course_title(session, lesson)

            visual_data = analysis.get("visual_data")
            prompt = None
            if isinstance(visual_data, dict):
                infographic = visual_data.get("infographic")
                if isinstance(infographic, dict):
                    prompt = (infographic.get("image_prompt") or "").strip() or None

            if not prompt:
                base = lesson_title or "educational lesson"
                prompt = f"clean educational cover, {base}"
                if course_title:
                    prompt += f", {course_title}"
                prompt += ", modern classroom illustration"

            print(f"[GEN]  lesson_id={row.lesson_id} regenerating cover image…")
            if not dry_run:
                new_url = ImageGenerationService.generate_cover_image_url(prompt)
                if new_url:
                    next_analysis = dict(analysis)
                    next_analysis["cover_image_url"] = new_url
                    row.ai_analysis = next_analysis
                    session.add(row)
                    print(f"       → {new_url}")
                    regenerated += 1
                else:
                    print(f"       → FAILED (all OpenAI keys exhausted)")
                    skipped += 1
            else:
                regenerated += 1

        if not dry_run:
            session.commit()

        tag = "[DRY-RUN] " if dry_run else ""
        print(
            f"\n{tag}Done. "
            f"already_in_s3={already_in_s3}, "
            f"uploaded={uploaded}, "
            f"regenerated={regenerated}, "
            f"skipped={skipped}"
        )

    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--video-id", help="Only process one lesson/video UUID")
    parser.add_argument("--regenerate", action="store_true", help="Call OpenAI to regenerate covers whose local file is gone")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not upload or write DB")
    args = parser.parse_args()
    raise SystemExit(run(video_id=args.video_id, regenerate=args.regenerate, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
