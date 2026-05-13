"""Kiểm tra mở rộng đoạn handsign (giai đoạn 0/1)."""
from src.backend.services.handsign_animation_service import (
    expand_handsign_segments,
    build_render_manifest,
)


def test_expand_segments_two_glosses():
    g = [
        {"time": 0, "word": "a", "vsl_info": {"hand": "h1"}},
        {"time": 2, "word": "b", "vsl_info": {"hand": "h2"}},
    ]
    segs = expand_handsign_segments(g)
    assert len(segs) == 2
    assert segs[0]["start"] == 0 and segs[0]["end"] == 2
    assert segs[1]["start"] == 2 and segs[1]["end"] == 3.5


def test_manifest_schema():
    m = build_render_manifest("vid-1", [{"start": 0, "end": 1, "word": "x", "vsl_info": None}])
    assert m["schema"] == "a20-handsign-export/v1"
    assert m["video_id"] == "vid-1"
    assert m["fps"] == 30
