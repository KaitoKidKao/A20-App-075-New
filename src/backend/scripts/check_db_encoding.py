from __future__ import annotations

from sqlmodel import text

from src.backend.database import engine


def main() -> None:
    with engine.connect() as conn:
        server = conn.execute(text("SHOW server_encoding")).scalar_one()
        client = conn.execute(text("SHOW client_encoding")).scalar_one()
    print(f"server_encoding={server}")
    print(f"client_encoding={client}")


if __name__ == "__main__":
    main()

