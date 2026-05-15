from typing import Any

from src.backend.services.handsign_animation_service import normalize_glosses


ARTIFACT_KEYS = (
    "summary",
    "timeline",
    "highlights",
    "questions",
    "briefing",
    "flashcards",
    "quizzes",
    "visual_data",
    "handsign_data",
)


def _status_ready(data: Any) -> bool:
    if data is None:
        return False
    if isinstance(data, (list, dict)):
        return len(data) > 0
    return True


def artifact_status(data: Any, error: str | None = None) -> dict[str, Any]:
    if error:
        return {"status": "failed", "error": error}
    return {"status": "ready" if _status_ready(data) else "empty", "error": None}


def normalize_summary(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def normalize_timeline(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if not isinstance(item, dict):
            continue
        time = str(item.get("time", "")).strip()
        title = str(item.get("title", "")).strip()
        if time and title:
            items.append({"time": time, "title": title})
    return items


def normalize_highlights(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if not isinstance(item, dict):
            continue
        time = str(item.get("time", "")).strip()
        reason = str(item.get("reason", "")).strip()
        context = str(item.get("context", "")).strip()
        if time and (reason or context):
            items.append({"time": time, "reason": reason, "context": context})
    return items


def normalize_questions(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if not isinstance(item, dict):
            continue
        time = str(item.get("time", "")).strip()
        original = str(item.get("original", "")).strip()
        rephrased = str(item.get("rephrased", "")).strip()
        if original or rephrased:
            items.append({"time": time, "original": original, "rephrased": rephrased})
    return items


def normalize_briefing(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        return {}
    objective = str(value.get("objective", "")).strip()
    summary = str(value.get("summary", "")).strip()
    key_terms_raw = value.get("key_terms", [])
    key_terms = [
        str(term).strip()
        for term in key_terms_raw
        if str(term).strip()
    ] if isinstance(key_terms_raw, list) else []
    if not objective and not summary and not key_terms:
        return {}
    return {"objective": objective, "summary": summary, "key_terms": key_terms}


def normalize_flashcards(value: Any) -> list[dict[str, str | None]]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if not isinstance(item, dict):
            continue
        front = str(item.get("front", "")).strip()
        back = str(item.get("back", "")).strip()
        hint = item.get("hint")
        if front and back:
            items.append(
                {
                    "front": front,
                    "back": back,
                    "hint": str(hint).strip() if hint else None,
                }
            )
    return items


def normalize_quizzes(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if not isinstance(item, dict):
            continue
        question_text = str(item.get("question_text", "")).strip()
        options = item.get("options", {})
        correct_answer = str(item.get("correct_answer", "")).strip()
        if question_text and isinstance(options, dict) and correct_answer in options:
            items.append(
                {
                    "question_text": question_text,
                    "options": options,
                    "correct_answer": correct_answer,
                    "explanation": str(item.get("explanation", "")).strip(),
                    "difficulty": str(item.get("difficulty", "Trung binh")).strip(),
                }
            )
    return items


def build_ai_analysis(
    *,
    transcript: dict,
    summary: Any,
    metadata: Any,
    briefing: Any,
    notebook_data: Any,
    handsign_data: Any,
    quizzes: Any,
    errors: dict[str, str | None] | None = None,
) -> dict[str, Any]:
    errors = errors or {}
    metadata = metadata if isinstance(metadata, dict) else {}
    notebook_data = notebook_data if isinstance(notebook_data, dict) else {}

    normalized = {
        "transcript": transcript,
        "summary": normalize_summary(summary),
        "timeline": normalize_timeline(metadata.get("timeline")),
        "highlights": normalize_highlights(metadata.get("highlights")),
        "questions": normalize_questions(metadata.get("questions")),
        "briefing": normalize_briefing(briefing),
        "visual_data": notebook_data.get("visual_data") if isinstance(notebook_data.get("visual_data"), dict) else {},
        "cover_image_url": notebook_data.get("cover_image_url"),
        "handsign_data": normalize_glosses(handsign_data),
        "flashcards": normalize_flashcards(notebook_data.get("flashcards")),
        "quizzes": normalize_quizzes(quizzes),
    }

    normalized["artifact_status"] = {
        "transcript": {"status": "ready", "error": None},
        "summary": artifact_status(normalized["summary"], errors.get("summary")),
        "timeline": artifact_status(normalized["timeline"], errors.get("metadata")),
        "highlights": artifact_status(normalized["highlights"], errors.get("metadata")),
        "questions": artifact_status(normalized["questions"], errors.get("metadata")),
        "briefing": artifact_status(normalized["briefing"], errors.get("briefing")),
        "visual_data": artifact_status(normalized["visual_data"], errors.get("notebook_data")),
        "flashcards": artifact_status(normalized["flashcards"], errors.get("notebook_data")),
        "handsign_data": artifact_status(normalized["handsign_data"], errors.get("handsign_data")),
        "quizzes": artifact_status(normalized["quizzes"], errors.get("quizzes")),
    }
    return normalized
