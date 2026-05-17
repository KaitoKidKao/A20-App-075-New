#!/usr/bin/env python3
"""
Fix Vietnamese mojibake in DB text fields.

Usage:
  python -m src.backend.scripts.fix_encoding
  python -m src.backend.scripts.fix_encoding --dry-run
"""

from __future__ import annotations

import argparse
from sqlalchemy import text

from src.backend.database import engine

TABLES_COLUMNS: list[tuple[str, list[str]]] = [
    ("courses", ["title", "description"]),
    ("modules", ["title", "description"]),
    ("lessons", ["title"]),
    ("quizzes", ["title"]),
    ("questions", ["question_text", "explanation", "difficulty"]),
    ("question_options", ["option_text"]),
    ("flashcards", ["front", "back", "hint"]),
]


def try_fix_encoding(text: str) -> str | None:
    if not text:
        return None
    try:
        fixed = text.encode("latin1").decode("utf-8")
    except (UnicodeDecodeError, UnicodeEncodeError):
        return None

    if fixed == text:
        return None

    before = text.count("Ã") + text.count("Â") + text.count("�")
    after = fixed.count("Ã") + fixed.count("Â") + fixed.count("�")
    return fixed if after <= before else None


def fix_table(conn, table: str, columns: list[str], dry_run: bool) -> int:
    rows = conn.execute(text(f"SELECT id, {', '.join(columns)} FROM {table}")).fetchall()  # nosec B608

    fixed_count = 0
    for row in rows:
        row_id = row[0]
        updates: dict[str, str] = {}

        for idx, col in enumerate(columns, start=1):
            val = row[idx]
            if isinstance(val, str):
                fixed = try_fix_encoding(val)
                if fixed and fixed != val:
                    updates[col] = fixed

        if updates:
            set_clause = ", ".join(f"{col} = :{col}" for col in updates)
            params = {**updates, "row_id": row_id}
            if not dry_run:
                conn.execute(
                    text(f"UPDATE {table} SET {set_clause} WHERE id = :row_id"),  # nosec B608
                    params,
                )
            fixed_count += 1
            print(f"  Fixed row id={row_id}: {list(updates.keys())}")

    print(f"  Total fixed in {table}: {fixed_count}/{len(rows)} rows")
    return fixed_count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Only print rows that would be updated.")
    args = parser.parse_args()

    print("Connecting to DB via project engine...")
    total = 0
    with engine.begin() as conn:
        if conn.dialect.name == "postgresql":
            conn.execute(text("SET client_encoding TO 'UTF8'"))
        for table, columns in TABLES_COLUMNS:
            print(f"\nProcessing table: {table}")
            try:
                total += fix_table(conn, table, columns, dry_run=args.dry_run)
            except Exception as exc:
                print(f"  ERROR: {exc}")

    mode = "DRY-RUN" if args.dry_run else "APPLIED"
    print(f"\nDone. mode={mode}, total_changes={total}")


if __name__ == "__main__":
    main()
