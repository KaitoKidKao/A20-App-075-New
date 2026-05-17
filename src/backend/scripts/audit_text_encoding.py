from __future__ import annotations

import argparse
from pathlib import Path


TEXT_EXTENSIONS = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".env",
    ".txt",
    ".sql",
}

SKIP_DIR_NAMES = {
    ".git",
    ".next",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    "dist",
    "build",
}

MOJIBAKE_MARKERS = ("Ã", "Â", "ï¿½")


def should_scan(path: Path) -> bool:
    if any(part in SKIP_DIR_NAMES for part in path.parts):
        return False
    return path.suffix.lower() in TEXT_EXTENSIONS or path.name in {".env", ".env.example"}


def inspect_file(path: Path) -> list[str]:
    issues: list[str] = []
    raw = path.read_bytes()

    if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
        issues.append("utf16-bom")
        return issues

    if raw.startswith(b"\xef\xbb\xbf"):
        issues.append("utf8-bom")

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        issues.append("not-utf8")
        return issues

    if any(marker in text for marker in MOJIBAKE_MARKERS):
        issues.append("mojibake-marker")

    if "\x00" in text:
        issues.append("null-byte")

    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit text files for encoding issues.")
    parser.add_argument("--root", type=str, default=".", help="Root directory to scan.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    issues_found = 0
    scanned = 0
    for path in root.rglob("*"):
        if not path.is_file() or not should_scan(path):
            continue
        scanned += 1
        issues = inspect_file(path)
        if issues:
            issues_found += 1
            rel = path.relative_to(root)
            print(f"[ISSUE] {rel} -> {', '.join(issues)}")

    print(f"\nScan complete. scanned={scanned}, files_with_issues={issues_found}")
    return 1 if issues_found else 0


if __name__ == "__main__":
    raise SystemExit(main())
