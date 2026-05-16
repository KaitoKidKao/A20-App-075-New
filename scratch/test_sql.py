import os
import sys
from sqlmodel import Session, text

# Thêm src vào sys.path để import được database và config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.backend.database import engine

def test_queries():
    queries = [
        "SELECT to_regclass('public.deletion_audits');",
        "SELECT version_num FROM alembic_version;"
    ]
    
    with Session(engine) as session:
        for q in queries:
            print(f"\n--- Executing: {q} ---")
            try:
                result = session.exec(text(q)).first()
                print(f"Result: {result}")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    test_queries()
