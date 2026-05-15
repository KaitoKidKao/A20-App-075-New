"""Kiem tra chuan hoa gloss VSL va manifest avatar."""
from src.backend.services.handsign_animation_service import (
    build_handsign_payload,
    build_render_manifest,
    expand_handsign_segments,
    normalize_glosses,
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
    assert segs[0]["review_status"] == "needs_review"


def test_normalize_glosses_adds_review_metadata_and_sorts():
    glosses = normalize_glosses(
        [
            {"time": 3, "word": "hoc"},
            {"time": "1.5", "word": "AI", "review_status": "reviewed"},
            {"time": "bad", "word": ""},
        ]
    )
    assert [g["word"] for g in glosses] == ["AI", "hoc"]
    assert glosses[0]["review_status"] == "reviewed"
    assert glosses[1]["source"] == "ai"


def test_handsign_payload_contains_review_and_avatar_state():
    payload = build_handsign_payload("vid-1", [{"time": 0, "word": "ai"}])
    assert payload["schema"] == "a20-vsl-gloss/v1"
    assert payload["review_required"] is True
    assert payload["review_status"] == "needs_review"
    assert payload["avatar"]["status"] == "not_generated"
    assert payload["glosses"][0]["word"] == "ai"
    assert "Avatar AI" in payload["disclaimer"]


def test_manifest_schema():
    m = build_render_manifest("vid-1", [{"start": 0, "end": 1, "word": "x", "vsl_info": None}])
    assert m["schema"] == "a20-handsign-export/v1"
    assert m["video_id"] == "vid-1"
    assert m["fps"] == 30
    assert m["review_required"] is True
