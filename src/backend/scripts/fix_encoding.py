#!/usr/bin/env python3
"""
Fix Vietnamese mojibake in DB text fields.

Usage:
  python -m src.backend.scripts.fix_encoding
  python -m src.backend.scripts.fix_encoding --dry-run
"""

from __future__ import annotations

import argparse
import os
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

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


def parse_database_url() -> dict:
    raw = os.getenv("DATABASE_URL", "").strip()
    if not raw:
        raise RuntimeError("DATABASE_URL is missing in environment/.env.")

    normalized = raw.replace("postgresql+psycopg://", "postgresql://")
    parsed = urlparse(normalized)
    if parsed.scheme not in {"postgresql", "postgres"}:
        raise RuntimeError(f"Unsupported DATABASE_URL scheme: {parsed.scheme}")

    database = (parsed.path or "").lstrip("/")
    if not database:
        raise RuntimeError("DATABASE_URL is missing database name.")

    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "user": parsed.username or "",
        "password": parsed.password or "",
        "database": database,
    }


def fix_table(conn, table: str, columns: list[str], dry_run: bool) -> int:
    cur = conn.cursor()
    cur.execute(f"SELECT id, {', '.join(columns)} FROM {table}")  # nosec B608
    rows = cur.fetchall()

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
            set_clause = ", ".join(f"{col} = %s" for col in updates)
            params = list(updates.values()) + [row_id]
            if not dry_run:
                cur.execute(
                    f"UPDATE {table} SET {set_clause} WHERE id = %s",  # nosec B608
                    params,
                )
            fixed_count += 1
            print(f"  Fixed row id={row_id}: {list(updates.keys())}")

    if not dry_run:
        conn.commit()
    cur.close()
    print(f"  Total fixed in {table}: {fixed_count}/{len(rows)} rows")
    return fixed_count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Only print rows that would be updated.")
    args = parser.parse_args()

    db_config = parse_database_url()
    print(
        f"Connecting to DB {db_config['host']}:{db_config['port']}/{db_config['database']} ..."
    )
    conn = psycopg2.connect(**db_config)

    total = 0
    for table, columns in TABLES_COLUMNS:
        print(f"\nProcessing table: {table}")
        try:
            total += fix_table(conn, table, columns, dry_run=args.dry_run)
        except Exception as exc:
            print(f"  ERROR: {exc}")
            conn.rollback()

    conn.close()
    mode = "DRY-RUN" if args.dry_run else "APPLIED"
    print(f"\nDone. mode={mode}, total_changes={total}")


if __name__ == "__main__":
    main()
