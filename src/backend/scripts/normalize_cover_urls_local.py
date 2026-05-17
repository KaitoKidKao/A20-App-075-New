import argparse
import base64
import json
import uuid
from pathlib import Path

from sqlmodel import Session, select

from src.backend import config
from src.backend.database import engine
from src.backend.models import ContentMetadata


AI_RESULTS_DIR = Path(config.UPLOADS_DIR) / "ai_results"
COVERS_DIR = Path(config.UPLOADS_DIR) / "covers"


def _extract_data_uri_b64(value: str | None) -> str | None:
    raw = (value or "").strip()
    if raw.startswith("data:image") and ";base64," in raw:
        return raw.split(";base64,", 1)[1].strip()
    return None


def _save_b64_to_cover(b64_data: str, dry_run: bool) -> str:
    filename = f"{uuid.uuid4()}.png"
    url = f"/uploads/covers/{filename}"
    if dry_run:
        return url
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    out = COVERS_DIR / filename
    out.write_bytes(base64.b64decode(b64_data))
    return url


def _sync_notebook(video_id: str, local_url: str, dry_run: bool) -> bool:
    notebook = AI_RESULTS_DIR / video_id / "notebook.json"
    if not notebook.exists():
        return False
    try:
        payload = json.loads(notebook.read_text(encoding="utf-8"))
    except Exception:
        return False
    payload["cover_image_url"] = local_url
    if not dry_run:
        notebook.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return True


def run(*, video_id: str | None, dry_run: bool) -> None:
    total = 0
    converted = 0
    skipped = 0
    notebook_synced = 0

    with Session(engine) as session:
        stmt = select(ContentMetadata)
        if video_id:
            lesson_uuid = uuid.UUID(video_id)
            stmt = stmt.where(ContentMetadata.lesson_id == lesson_uuid)
        rows = session.exec(stmt).all()

        for row in rows:
            total += 1
            vid = str(row.lesson_id)
            ai = dict(row.ai_analysis or {})
            cover = ai.get("cover_image_url")
            if not isinstance(cover, str):
                skipped += 1
                print(f"[SKIP] {vid} no cover_image_url")
                continue

            b64 = _extract_data_uri_b64(cover)
            if not b64:
                skipped += 1
                print(f"[SKIP] {vid} cover is not data-uri")
                continue

            local_url = _save_b64_to_cover(b64, dry_run=dry_run)
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
        description="Convert DB cover_image_url data-uri to local /uploads/covers and sync notebook.json."
    )
    parser.add_argument("--video-id", help="Only one lesson/video UUID")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not write")
    args = parser.parse_args()
    run(video_id=args.video_id, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

