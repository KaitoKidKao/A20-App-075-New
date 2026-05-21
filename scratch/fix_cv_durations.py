import sys, os
import random
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.abspath('.'))
from src.backend.database import engine
from sqlmodel import Session, select
from src.backend.models.course import Lesson

with Session(engine) as session:
    lessons = session.exec(select(Lesson).where(Lesson.title.contains('Image formation'))).all()
    for l in lessons:
        if l.duration_minutes == 0:
            l.duration_minutes = random.randint(5, 20)
            print(f'Set {l.title} to {l.duration_minutes}m')
    session.commit()
    print("Updated durations!")
