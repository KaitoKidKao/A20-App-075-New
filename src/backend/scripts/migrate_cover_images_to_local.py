import argparse
import base64
import json
import mimetypes
import urllib.request
import uuid
from pathlib import Path

from sqlmodel import Session, select

from src.backend import config
from src.backend.database import engine
from src.backend.models import ContentMetadata


AI_RESULTS_DIR = Path(config.UPLOADS_DIR) / "ai_results"
COVERS_DIR = Path(config.UPLOADS_DIR) / "covers"


def _extract_base64_data(value: str) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    if raw.startswith("data:image") and ";base64," in raw:
        return raw.split(";base64,", 1)[1].strip()
    return None


def _write_cover_file(b64_data: str, dry_run: bool, ext: str = ".png") -> str:
    normalized_ext = ext if ext.startswith(".") else f".{ext}"
    if normalized_ext.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
        normalized_ext = ".png"
    filename = f"{uuid.uuid4()}.png"
    if normalized_ext != ".png":
        filename = f"{uuid.uuid4()}{normalized_ext}"
    relative_url = f"/uploads/covers/{filename}"
    if dry_run:
        return relative_url

    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = COVERS_DIR / filename
    output_path.write_bytes(base64.b64decode(b64_data))
    return relative_url


def _download_remote_cover(url: str, dry_run: bool) -> str | None:
    raw = (url or "").strip()
    if not raw.startswith(("http://", "https://")):
        return None

    if dry_run:
        return f"/uploads/covers/{uuid.uuid4()}.png"

    req = urllib.request.Request(
        raw,
        headers={"User-Agent": "A20-Cover-Migrator/1.0"},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        content = response.read()
        content_type = response.headers.get("Content-Type", "").split(";")[0].strip().lower()
        ext = mimetypes.guess_extension(content_type) if content_type else None
        if not ext:
            ext = ".png"
        COVERS_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}{ext}"
        output_path = COVERS_DIR / filename
        output_path.write_bytes(content)
        return f"/uploads/covers/{filename}"


def _update_db_cover_url(video_id: str, cover_url: str, dry_run: bool) -> bool:
    try:
        lesson_id = uuid.UUID(video_id)
    except ValueError:
        return False

    with Session(engine) as session:
        row = session.exec(
            select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_id)
        ).first()
        if not row:
            return False
        ai = dict(row.ai_analysis or {})
        ai["cover_image_url"] = cover_url
        row.ai_analysis = ai
        session.add(row)
        if not dry_run:
            session.commit()
        return True


def migrate(video_id: str | None, dry_run: bool, migrate_remote: bool) -> None:
    if not AI_RESULTS_DIR.exists():
        print(f"[WARN] Missing folder: {AI_RESULTS_DIR}")
        return

    total = 0
    converted = 0
    remote_migrated = 0
    skipped = 0
    db_synced = 0

    targets: list[Path]
    if video_id:
        targets = [AI_RESULTS_DIR / video_id / "notebook.json"]
    else:
        targets = list(AI_RESULTS_DIR.glob("*/notebook.json"))

    for notebook_path in targets:
        total += 1
        current_video_id = notebook_path.parent.name

        if not notebook_path.exists():
            print(f"[SKIP] {current_video_id} notebook.json not found")
            skipped += 1
            continue

        try:
            payload = json.loads(notebook_path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"[SKIP] {current_video_id} invalid json: {exc}")
            skipped += 1
            continue

        cover_value = payload.get("cover_image_url")
        local_url: str | None = None

        if isinstance(cover_value, str):
            b64_data = _extract_base64_data(cover_value)
            if b64_data:
                try:
                    local_url = _write_cover_file(b64_data, dry_run=dry_run, ext=".png")
                    payload["cover_image_url"] = local_url
                    converted += 1
                except Exception as exc:
                    print(f"[SKIP] {current_video_id} cannot decode/write base64 image: {exc}")
                    skipped += 1
                    continue
            elif cover_value.startswith("/uploads/covers/"):
                local_url = cover_value
            elif migrate_remote and cover_value.startswith(("http://", "https://")):
                try:
                    downloaded = _download_remote_cover(cover_value, dry_run=dry_run)
                    if downloaded:
                        local_url = downloaded
                        payload["cover_image_url"] = local_url
                        remote_migrated += 1
                except Exception as exc:
                    print(f"[SKIP] {current_video_id} cannot download remote cover: {exc}")
                    skipped += 1
                    continue

        if not local_url:
            print(f"[SKIP] {current_video_id} no convertible/syncable cover value")
            skipped += 1
            continue

        if not dry_run and payload.get("cover_image_url") != cover_value:
            notebook_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

        if _update_db_cover_url(current_video_id, local_url, dry_run=dry_run):
            db_synced += 1

        mode = "DRY" if dry_run else "OK"
        print(f"[{mode}] {current_video_id} -> {local_url}")

    print(
        f"\nDone. total={total}, converted_base64={converted}, migrated_remote={remote_migrated}, skipped={skipped}, db_synced={db_synced}, dry_run={dry_run}, migrate_remote={migrate_remote}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert base64 cover_image_url in notebook.json to local /uploads/covers/*.png and sync DB."
    )
    parser.add_argument("--video-id", help="Only process one video id (folder name in ai_results).")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not write files/db.")
    parser.add_argument(
        "--migrate-remote",
        action="store_true",
        help="Also download remote HTTP(S) cover URLs to local /uploads/covers and replace them.",
    )
    args = parser.parse_args()
    migrate(video_id=args.video_id, dry_run=args.dry_run, migrate_remote=args.migrate_remote)


if __name__ == "__main__":
    main()
