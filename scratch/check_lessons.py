import os
import sys
from sqlmodel import Session, create_engine, select

# Adjust path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.backend.models import Lesson, Module

DATABASE_URL = "postgresql+psycopg://user:password@localhost:5432/app075"
engine = create_engine(DATABASE_URL)

with Session(engine) as session:
    lessons = session.exec(select(Lesson)).all()
    
    # Let's print out lessons grouped by module
    modules = session.exec(select(Module)).all()
    module_map = {m.id: m.title for m in modules}
    
    lessons_by_module = {}
    for l in lessons:
        lessons_by_module.setdefault(l.module_id, []).append(l)
        
    with open("scratch/db_lessons.txt", "w", encoding="utf-8") as f:
        f.write(f"Total lessons: {len(lessons)}\n")
        for mid, mtitle in module_map.items():
            mod_lessons = lessons_by_module.get(mid, [])
            if not mod_lessons:
                continue
            f.write(f"\nModule: {mtitle} (ID: {mid})\n")
            for l in sorted(mod_lessons, key=lambda x: (x.sort_order or 0, x.created_at or '')):
                f.write(f"  Lesson ID: {l.id} | sort_order: {l.sort_order} | Title: {l.title} | Created At: {l.created_at}\n")
    print("Done writing to scratch/db_lessons.txt")
