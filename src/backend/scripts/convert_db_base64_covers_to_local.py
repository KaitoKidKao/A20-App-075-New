import argparse
import base64
import json
import uuid
from pathlib import Path

from sqlmodel import Session, select

from src.backend import config
from src.backend.database import engine
from src.backend.models import ContentMetadata


COVERS_DIR = Path(config.UPLOADS_DIR) / "covers"
AI_RESULTS_DIR = Path(config.UPLOADS_DIR) / "ai_results"


def _extract_data_uri(value: str | None) -> tuple[str, str] | None:
    raw = (value or "").strip()
    if not raw.startswith("data:image/") or ";base64," not in raw:
        return None
    header, payload = raw.split(";base64,", 1)
    mime = header.replace("data:", "", 1).strip().lower()
    ext = ".png"
    if mime.endswith("jpeg") or mime.endswith("jpg"):
        ext = ".jpg"
    elif mime.endswith("webp"):
        ext = ".webp"
    return payload, ext


def _save_cover(payload_b64: str, ext: str, dry_run: bool) -> str:
    filename = f"{uuid.uuid4()}{ext}"
    relative_url = f"/uploads/covers/{filename}"
    if dry_run:
        return relative_url
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    (COVERS_DIR / filename).write_bytes(base64.b64decode(payload_b64))
    return relative_url


def _sync_notebook(video_id: str, new_url: str, dry_run: bool) -> bool:
    notebook = AI_RESULTS_DIR / video_id / "notebook.json"
    if not notebook.exists():
        return False
    try:
        data = json.loads(notebook.read_text(encoding="utf-8"))
    except Exception:
        return False
    data["cover_image_url"] = new_url
    if not dry_run:
        notebook.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return True


def run(video_id: str | None, dry_run: bool) -> None:
    with Session(engine) as session:
        stmt = select(ContentMetadata)
        if video_id:
            stmt = stmt.where(ContentMetadata.lesson_id == uuid.UUID(video_id))
        rows = list(session.exec(stmt).all())

        total = len(rows)
        converted = 0
        skipped = 0
        notebook_synced = 0

        for row in rows:
            ai = dict(row.ai_analysis or {})
            current = ai.get("cover_image_url")
            parsed = _extract_data_uri(current if isinstance(current, str) else None)
            vid = str(row.lesson_id)

            if not parsed:
                skipped += 1
                continue

            payload_b64, ext = parsed
            try:
                local_url = _save_cover(payload_b64, ext, dry_run=dry_run)
            except Exception as exc:
                print(f"[SKIP] {vid} decode/write failed: {exc}")
                skipped += 1
                continue

            ai["cover_image_url"] = local_url
            row.ai_analysis = ai
            session.add(row)
            converted += 1
            if _sync_notebook(vid, local_url, dry_run=dry_run):
                notebook_synced += 1
            mode = "DRY" if dry_run else "OK"
            print(f"[{mode}] {vid} -> {local_url}")

        if dry_run:
            session.rollback()
        else:
            session.commit()

        print(
            f"\nDone. total={total}, converted={converted}, skipped={skipped}, notebook_synced={notebook_synced}, dry_run={dry_run}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert ContentMetadata.ai_analysis.cover_image_url from base64 data URI to local /uploads/covers URL."
    )
    parser.add_argument("--video-id", help="Only process one video id (UUID).")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not write db/files.")
    args = parser.parse_args()
    run(video_id=args.video_id, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

