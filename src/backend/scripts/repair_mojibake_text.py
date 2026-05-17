from __future__ import annotations

import argparse
import re
import json
from dataclasses import dataclass
from typing import Iterable

from sqlmodel import Session, select

from src.backend.database import engine
from src.backend.models.assessment import Question, QuestionOption, Quiz
from src.backend.models.course import Course, Module, Lesson
from src.backend.models.flashcard import Flashcard
from src.backend.utils.datetime_utils import utc_now


VI_CHARS_RE = re.compile(
    r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
    flags=re.IGNORECASE,
)


@dataclass
class Change:
    table: str
    row_id: str
    field: str
    old: str
    new: str


def _decode_utf8_from_latin1(text: str) -> str:
    try:
        return text.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
    except Exception:
        return text


def _score_text(text: str) -> int:
    vi_count = len(VI_CHARS_RE.findall(text))
    bad_count = text.count("�")
    weird_sep = text.count("¦")
    return vi_count * 4 - bad_count * 6 - weird_sep * 2


def _best_candidate(raw: str) -> str:
    raw = (raw or "").replace("\x00", "").strip()
    if not raw:
        return ""
    c1 = raw
    c2 = _decode_utf8_from_latin1(c1)
    c3 = _decode_utf8_from_latin1(c2)
    best = sorted([c1, c2, c3], key=_score_text, reverse=True)[0]
    return re.sub(r"\s{2,}", " ", best).strip()


def _normalize_dictionary(text: str) -> str:
    if not text:
        return text

    # Common mojibake fragments observed in this project
    replacements_contains = [
        ("B�i gi", "Bài gi"),
        ("b�i gi", "bài gi"),
        ("Kh�a h", "Khóa h"),
        ("kh�a h", "khóa h"),
        ("chÆ°Æ¡ng", "chương"),
        ("ChÆ°Æ¡ng", "Chương"),
        ("há»c", "học"),
        ("Tá»±", "Tự"),
        ("tá»±", "tự"),
        ("Ä‘", "đ"),
        ("Ä", "Đ"),
    ]
    out = text
    for src, dst in replacements_contains:
        out = out.replace(src, dst)

    # Remove separator artifacts often appearing in broken strings
    out = out.replace("¦", " ")
    out = re.sub(r"\s{2,}", " ", out).strip()

    # Phrase-level canonical normalization
    lowered = out.lower()
    if "khu tu hoc ca nhan cho video hoc sinh tu tai len" in _slug(lowered):
        return "Không gian tự học cá nhân cho các video bạn tự tải lên."
    if _slug(lowered) in {"bai giang", "bai gi"}:
        return "Bài giảng"
    return out


def _slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def repair_text(value: str | None) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""
    best = _best_candidate(raw)
    normalized = _normalize_dictionary(best)
    return normalized


def load_id_overrides(path: str | None) -> dict:
    if not path:
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("Overrides file must be a JSON object.")
    return data


def apply_override(overrides: dict, table: str, row_id: str, field: str, default: str) -> str:
    """
    Priority:
      1) overrides[table][row_id][field]
      2) overrides[table][row_id] (string -> assumed title)
    """
    table_map = overrides.get(table, {})
    row_map = table_map.get(row_id)
    if isinstance(row_map, dict):
        value = row_map.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()
    if isinstance(row_map, str) and row_map.strip() and field == "title":
        return row_map.strip()
    return default


def _track_change(changes: list[Change], table: str, row_id: str, field: str, old: str | None, new: str | None) -> None:
    old_val = (old or "").strip()
    new_val = (new or "").strip()
    if old_val != new_val:
        changes.append(Change(table=table, row_id=row_id, field=field, old=old_val, new=new_val))


def run(dry_run: bool, overrides: dict) -> int:
    changes: list[Change] = []
    now = utc_now()

    with Session(engine) as session:
        courses = session.exec(select(Course)).all()
        modules = session.exec(select(Module)).all()
        lessons = session.exec(select(Lesson)).all()
        quizzes = session.exec(select(Quiz)).all()
        questions = session.exec(select(Question)).all()
        question_options = session.exec(select(QuestionOption)).all()
        flashcards = session.exec(select(Flashcard)).all()

        for row in courses:
            new_title = repair_text(row.title)
            new_desc = repair_text(row.description)
            new_title = apply_override(overrides, "courses", str(row.id), "title", new_title)
            new_desc = apply_override(overrides, "courses", str(row.id), "description", new_desc)
            _track_change(changes, "courses", str(row.id), "title", row.title, new_title)
            _track_change(changes, "courses", str(row.id), "description", row.description, new_desc)
            if not dry_run:
                row.title = new_title
                row.description = new_desc or None
                row.updated_at = now
                session.add(row)

        for row in modules:
            new_title = repair_text(row.title)
            new_desc = repair_text(row.description)
            new_title = apply_override(overrides, "modules", str(row.id), "title", new_title)
            new_desc = apply_override(overrides, "modules", str(row.id), "description", new_desc)
            _track_change(changes, "modules", str(row.id), "title", row.title, new_title)
            _track_change(changes, "modules", str(row.id), "description", row.description, new_desc)
            if not dry_run:
                row.title = new_title
                row.description = new_desc or None
                session.add(row)

        for row in lessons:
            new_title = repair_text(row.title)
            new_title = apply_override(overrides, "lessons", str(row.id), "title", new_title)
            _track_change(changes, "lessons", str(row.id), "title", row.title, new_title)
            if not dry_run:
                row.title = new_title
                session.add(row)

        for row in quizzes:
            new_title = repair_text(row.title)
            new_title = apply_override(overrides, "quizzes", str(row.id), "title", new_title)
            _track_change(changes, "quizzes", str(row.id), "title", row.title, new_title)
            if not dry_run:
                row.title = new_title
                session.add(row)

        for row in questions:
            new_text = repair_text(row.question_text)
            new_explanation = repair_text(row.explanation)
            new_difficulty = repair_text(row.difficulty)
            new_text = apply_override(overrides, "questions", str(row.id), "question_text", new_text)
            new_explanation = apply_override(overrides, "questions", str(row.id), "explanation", new_explanation)
            new_difficulty = apply_override(overrides, "questions", str(row.id), "difficulty", new_difficulty)
            _track_change(changes, "questions", str(row.id), "question_text", row.question_text, new_text)
            _track_change(changes, "questions", str(row.id), "explanation", row.explanation, new_explanation)
            _track_change(changes, "questions", str(row.id), "difficulty", row.difficulty, new_difficulty)
            if not dry_run:
                row.question_text = new_text
                row.explanation = new_explanation or None
                row.difficulty = new_difficulty or row.difficulty
                session.add(row)

        for row in question_options:
            new_text = repair_text(row.option_text)
            new_text = apply_override(overrides, "question_options", str(row.id), "option_text", new_text)
            _track_change(changes, "question_options", str(row.id), "option_text", row.option_text, new_text)
            if not dry_run:
                row.option_text = new_text
                session.add(row)

        for row in flashcards:
            new_front = repair_text(row.front)
            new_back = repair_text(row.back)
            new_hint = repair_text(row.hint)
            new_front = apply_override(overrides, "flashcards", str(row.id), "front", new_front)
            new_back = apply_override(overrides, "flashcards", str(row.id), "back", new_back)
            new_hint = apply_override(overrides, "flashcards", str(row.id), "hint", new_hint)
            _track_change(changes, "flashcards", str(row.id), "front", row.front, new_front)
            _track_change(changes, "flashcards", str(row.id), "back", row.back, new_back)
            _track_change(changes, "flashcards", str(row.id), "hint", row.hint, new_hint)
            if not dry_run:
                row.front = new_front
                row.back = new_back
                row.hint = new_hint or None
                session.add(row)

        if not dry_run:
            session.commit()

    print(f"{'DRY-RUN' if dry_run else 'APPLIED'}: total_changes={len(changes)}")
    for c in changes[:200]:
        print(f"[{c.table}] {c.row_id} field={c.field}")
        print(f"  old: {c.old}")
        print(f"  new: {c.new}")
    if len(changes) > 200:
        print(f"... {len(changes) - 200} more changes omitted")
    return len(changes)


def audit(limit: int) -> int:
    """
    Scan likely mojibake records without modifying DB.
    """
    suspicious: list[Change] = []

    def is_suspicious(s: str) -> bool:
        if not s:
            return False
        return ("�" in s) or ("¦" in s) or ("Ã" in s) or ("Ä" in s) or ("á»" in s)

    with Session(engine) as session:
        courses = session.exec(select(Course)).all()
        modules = session.exec(select(Module)).all()
        lessons = session.exec(select(Lesson)).all()
        quizzes = session.exec(select(Quiz)).all()
        questions = session.exec(select(Question)).all()
        question_options = session.exec(select(QuestionOption)).all()
        flashcards = session.exec(select(Flashcard)).all()

        for row in courses:
            for field, value in [("title", row.title), ("description", row.description or "")]:
                if is_suspicious(value or ""):
                    suspicious.append(
                        Change("courses", str(row.id), field, value or "", repair_text(value or ""))
                    )
        for row in modules:
            for field, value in [("title", row.title), ("description", row.description or "")]:
                if is_suspicious(value or ""):
                    suspicious.append(
                        Change("modules", str(row.id), field, value or "", repair_text(value or ""))
                    )
        for row in lessons:
            if is_suspicious(row.title or ""):
                suspicious.append(
                    Change("lessons", str(row.id), "title", row.title or "", repair_text(row.title or ""))
                )
        for row in quizzes:
            if is_suspicious(row.title or ""):
                suspicious.append(
                    Change("quizzes", str(row.id), "title", row.title or "", repair_text(row.title or ""))
                )
        for row in questions:
            if is_suspicious(row.question_text or ""):
                suspicious.append(
                    Change("questions", str(row.id), "question_text", row.question_text or "", repair_text(row.question_text or ""))
                )
            if is_suspicious(row.explanation or ""):
                suspicious.append(
                    Change("questions", str(row.id), "explanation", row.explanation or "", repair_text(row.explanation or ""))
                )
            if is_suspicious(row.difficulty or ""):
                suspicious.append(
                    Change("questions", str(row.id), "difficulty", row.difficulty or "", repair_text(row.difficulty or ""))
                )
        for row in question_options:
            if is_suspicious(row.option_text or ""):
                suspicious.append(
                    Change("question_options", str(row.id), "option_text", row.option_text or "", repair_text(row.option_text or ""))
                )
        for row in flashcards:
            if is_suspicious(row.front or ""):
                suspicious.append(
                    Change("flashcards", str(row.id), "front", row.front or "", repair_text(row.front or ""))
                )
            if is_suspicious(row.back or ""):
                suspicious.append(
                    Change("flashcards", str(row.id), "back", row.back or "", repair_text(row.back or ""))
                )
            if is_suspicious(row.hint or ""):
                suspicious.append(
                    Change("flashcards", str(row.id), "hint", row.hint or "", repair_text(row.hint or ""))
                )

    print(f"AUDIT: suspicious_records={len(suspicious)}")
    for c in suspicious[:limit]:
        print(f"[{c.table}] {c.row_id} field={c.field}")
        print(f"  raw : {c.old}")
        print(f"  fix : {c.new}")
    if len(suspicious) > limit:
        print(f"... {len(suspicious) - limit} more omitted (increase --limit)")
    return len(suspicious)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Repair mojibake text in courses/modules/lessons using auto-decoding + dictionary mapping."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply updates to database. Default is dry-run.",
    )
    parser.add_argument(
        "--overrides",
        type=str,
        default=None,
        help="Path to JSON file containing exact title/description overrides by table/id.",
    )
    parser.add_argument(
        "--audit",
        action="store_true",
        help="Audit suspicious mojibake texts only (no write).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=200,
        help="Max rows printed for audit mode.",
    )
    args = parser.parse_args()

    if args.audit:
        audit(limit=max(1, args.limit))
        return

    overrides = load_id_overrides(args.overrides)
    run(dry_run=not args.apply, overrides=overrides)


if __name__ == "__main__":
    main()
