#!/usr/bin/env python3
"""
Prepare dump_utf8.sql for import into production RDS.

Steps:
1. Extract the app075 database section (skip cluster-level headers)
2. Remove pgAdmin-specific directives (\restrict, \unrestrict, \connect)
3. Fix CP437 mojibake encoding in data
4. Write clean SQL to output file

Usage:
    python src/backend/scripts/prepare_import.py
    python src/backend/scripts/prepare_import.py --input dump_utf8.sql --output clean_import.sql
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def fix_mojibake(text: str) -> str:
    """Fix CP437-as-UTF-8 mojibake. Returns original if conversion fails or produces no change."""
    try:
        fixed = text.encode("cp437").decode("utf-8")
        return fixed if fixed != text else text
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text


# Detect mojibake by presence of box-drawing / latin-extension chars that
# are hallmarks of CP437 stored as UTF-8.
_MOJIBAKE_PATTERN = re.compile(
    r"[├│╗║╔╝╚╠╣╦╩╬░▒▓─┤┬┼┴┐└┘┌]"
    r"|ß[║╗╝╚╔╠╣╦╩╬]"   # ß followed by box chars = strong signal
)


def maybe_fix_line(line: str) -> str:
    """Fix a single line if it looks like it contains mojibake."""
    if not _MOJIBAKE_PATTERN.search(line):
        return line
    return fix_mojibake(line)


# Lines to skip (pgAdmin cluster-level directives)
_SKIP_PATTERNS = (
    re.compile(r"^\\restrict\b"),
    re.compile(r"^\\unrestrict\b"),
    re.compile(r"^\\connect\b"),
    re.compile(r"^DROP DATABASE\b"),
    re.compile(r"^DROP ROLE\b"),
    re.compile(r"^CREATE ROLE\b"),
    re.compile(r"^ALTER ROLE\b"),
    re.compile(r"^CREATE DATABASE\b"),
    re.compile(r"^ALTER DATABASE\b"),
    re.compile(r"^UPDATE pg_catalog"),
)


def should_skip(line: str) -> bool:
    stripped = line.strip()
    return any(p.match(stripped) for p in _SKIP_PATTERNS)


def process(input_path: Path, output_path: Path) -> None:
    print(f"Reading {input_path} ...")
    with input_path.open(encoding="utf-8-sig", errors="replace") as f:
        lines = f.readlines()

    print(f"Total lines: {len(lines)}")

    # Find start of app075 database section
    start_idx = 0
    for i, line in enumerate(lines):
        if "\\connect app075" in line or "connect app075" in line.lower():
            start_idx = i + 1  # skip the \connect line itself
            break

    if start_idx == 0:
        print("WARNING: Could not find '\\connect app075' marker — processing full file")

    print(f"Extracting from line {start_idx + 1} to {len(lines)} ...")

    fixed_count = 0
    skipped_count = 0
    out_lines: list[str] = [
        "-- Prepared by prepare_import.py\n",
        "SET client_encoding = 'UTF8';\n",
        "SET standard_conforming_strings = on;\n",
        "SET search_path = public;\n",
        "\n",
    ]

    for raw_line in lines[start_idx:]:
        if should_skip(raw_line):
            skipped_count += 1
            continue

        fixed_line = maybe_fix_line(raw_line)
        if fixed_line != raw_line:
            fixed_count += 1

        out_lines.append(fixed_line)

    print(f"Skipped {skipped_count} cluster-level lines")
    print(f"Fixed encoding in {fixed_count} lines")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        f.writelines(out_lines)

    size_mb = output_path.stat().st_size / 1024 / 1024
    print(f"Written to {output_path} ({size_mb:.1f} MB)")
    print("\nNext steps:")
    print("  1. Copy clean_import.sql to EC2:")
    print("     scp -i dream-lms.pem clean_import.sql ec2-user@13.214.67.239:~/")
    print("  2. On EC2, reset schema and import:")
    print("     PGPASSWORD='mI(i_Vy3ClA#pQ651ii+^cyv' psql \\")
    print("       -h a20-prod-postgres.cr20o6kqs106.ap-southeast-1.rds.amazonaws.com \\")
    print("       -U a20user -d a20db \\")
    print("       -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'")
    print("     PGPASSWORD='mI(i_Vy3ClA#pQ651ii+^cyv' psql \\")
    print("       -h a20-prod-postgres.cr20o6kqs106.ap-southeast-1.rds.amazonaws.com \\")
    print("       -U a20user -d a20db < ~/clean_import.sql")
    print("  3. Run encoding fix:")
    print("     sudo docker exec a20-backend-1 pip install psycopg2-binary -q")
    print("     sudo docker exec a20-backend-1 python -m src.backend.scripts.fix_encoding")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="dump_utf8.sql")
    parser.add_argument("--output", default="clean_import.sql")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    process(input_path, output_path)


if __name__ == "__main__":
    main()
