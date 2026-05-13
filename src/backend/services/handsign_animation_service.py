"""
Giai đoạn 0–1: chuẩn hóa chuỗi gloss → đoạn thời gian [start, end] và manifest export cho render ngoài (Blender/Unity).
"""
from __future__ import annotations

from typing import Any


def expand_handsign_segments(
    glosses: list[dict[str, Any]],
    *,
    tail_hold_seconds: float = 1.5,
    min_segment_seconds: float = 0.35,
) -> list[dict[str, Any]]:
    """
    Mỗi gloss có time = mốc bắt đầu; end = time của gloss kế hoặc + tail_hold cho gloss cuối.
    """
    if not glosses:
        return []

    items = sorted(glosses, key=lambda x: float(x.get("time") or 0))
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
        hand = None
        if isinstance(vi, dict):
            hand = vi.get("hand")

        out.append(
            {
                "start": t0,
                "end": t1,
                "word": g.get("word", ""),
                "vsl_info": vi,
                "hamnosys_hand": hand,
            }
        )

    return out


def build_render_manifest(
    video_id: str,
    segments: list[dict[str, Any]],
    *,
    fps: int = 30,
    schema: str = "a20-handsign-export/v1",
) -> dict[str, Any]:
    """Manifest JSON cho pipeline render offline (Blender/Unity) — không chứa mesh, chỉ timeline."""
    return {
        "schema": schema,
        "video_id": video_id,
        "fps": fps,
        "segments": segments,
        "notes": "HamNoSys hand string per segment; interpolate in DCC using institutional VSL rig.",
    }
