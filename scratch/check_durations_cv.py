import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.abspath('.'))
from src.backend.database import engine
from sqlmodel import Session, select
from src.backend.models.course import Lesson

with Session(engine) as session:
    lessons = session.exec(select(Lesson).where(Lesson.title.contains('Image formation'))).all()
    for l in lessons:
        print(f'Lesson: {l.title}, duration_minutes: {l.duration_minutes}')
