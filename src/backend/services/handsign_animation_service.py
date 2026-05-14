"""Tien ich chuan hoa gloss VSL va manifest render avatar."""
from __future__ import annotations

from typing import Any


HANDSIGN_PAYLOAD_SCHEMA = "a20-vsl-gloss/v1"
HANDSIGN_EXPORT_SCHEMA = "a20-handsign-export/v1"
HANDSIGN_DISCLAIMER = (
    "Avatar AI chi la cong cu ho tro truc quan, can giao vien hoac chuyen gia "
    "ngon ngu ky hieu ra soat truoc khi dung nhu tai lieu chinh thuc."
)
DEFAULT_REVIEW_STATUS = "needs_review"


def normalize_glosses(glosses: Any) -> list[dict[str, Any]]:
    """Chuan hoa gloss tu AI/user thanh cau truc on dinh de luu va render."""
    if not isinstance(glosses, list):
        return []

    normalized: list[dict[str, Any]] = []
    for item in glosses:
        if not isinstance(item, dict):
            continue

        word = str(item.get("word") or "").strip()
        if not word:
            continue

        try:
            time = float(item.get("time") or 0)
        except (TypeError, ValueError):
            time = 0.0

        try:
            index = int(item.get("index", len(normalized)))
        except (TypeError, ValueError):
            index = len(normalized)

        vsl_info = item.get("vsl_info")
        if not isinstance(vsl_info, dict):
            vsl_info = None

        normalized.append(
            {
                "index": index,
                "time": max(time, 0.0),
                "word": word,
                "vsl_info": vsl_info,
                "source": str(item.get("source") or "ai"),
                "review_status": str(item.get("review_status") or DEFAULT_REVIEW_STATUS),
            }
        )

    return sorted(normalized, key=lambda g: (float(g["time"]), int(g["index"])))


def expand_handsign_segments(
    glosses: list[dict[str, Any]],
    *,
    tail_hold_seconds: float = 1.5,
    min_segment_seconds: float = 0.35,
) -> list[dict[str, Any]]:
    """Moi gloss co time bat dau; end la time cua gloss ke tiep hoac tail hold."""
    items = normalize_glosses(glosses)
    if not items:
        return []

    out: list[dict[str, Any]] = []

    for i, g in enumerate(items):
        t0 = float(g.get("time") or 0)
        if i + 1 < len(items):
            t1 = float(items[i + 1].get("time") or 0)
        else:
            t1 = t0 + tail_hold_seconds

        if t1 <= t0:
            t1 = t0 + min_segment_seconds

        vi = g.get("vsl_info")
        hand = vi.get("hand") if isinstance(vi, dict) else None

        out.append(
            {
                "start": t0,
                "end": t1,
                "word": g.get("word", ""),
                "vsl_info": vi,
                "hamnosys_hand": hand,
                "source": g.get("source"),
                "review_status": g.get("review_status"),
            }
        )

    return out


def build_handsign_payload(
    video_id: str,
    glosses: Any,
    *,
    avatar: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Payload cong khai cho frontend: gloss, segment render, trang thai review/avatar."""
    normalized = normalize_glosses(glosses)
    avatar_state = avatar or {
        "video_id": video_id,
        "status": "not_generated",
        "avatar_video_url": None,
        "is_optional": True,
        "disclaimer": HANDSIGN_DISCLAIMER,
    }
    review_status = "empty" if not normalized else (
        "reviewed"
        if all(g.get("review_status") == "reviewed" for g in normalized)
        else DEFAULT_REVIEW_STATUS
    )

    return {
        "schema": HANDSIGN_PAYLOAD_SCHEMA,
        "video_id": video_id,
        "gloss_language": "vsl",
        "review_required": True,
        "review_status": review_status,
        "disclaimer": HANDSIGN_DISCLAIMER,
        "glosses": normalized,
        "segments": expand_handsign_segments(normalized),
        "avatar": avatar_state,
    }


def build_render_manifest(
    video_id: str,
    segments: list[dict[str, Any]],
    *,
    fps: int = 30,
    schema: str = HANDSIGN_EXPORT_SCHEMA,
) -> dict[str, Any]:
    """Manifest JSON cho pipeline render offline, khong chua mesh."""
    return {
        "schema": schema,
        "video_id": video_id,
        "fps": fps,
        "segments": segments,
        "review_required": True,
        "disclaimer": HANDSIGN_DISCLAIMER,
        "notes": "HamNoSys hand string per segment; interpolate in DCC using institutional VSL rig.",
    }
