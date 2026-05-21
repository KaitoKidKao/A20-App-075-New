import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.abspath('.'))
from src.backend.database import engine
from sqlmodel import Session, select
from src.backend.models.assessment import Question, QuestionOption
from src.backend.models.course import Lesson, Course, Module
from src.backend.models.flashcard import Flashcard

def fix_text(t):
    if not t: return t
    try:
        return t.encode('cp437').decode('utf-8')
    except Exception:
        return t

with Session(engine) as session:
    print("Fixing Questions...")
    for q in session.exec(select(Question)).all():
        q.question_text = fix_text(q.question_text)
        q.explanation = fix_text(q.explanation)
        
    print("Fixing Question Options...")
    for qo in session.exec(select(QuestionOption)).all():
        qo.option_text = fix_text(qo.option_text)
        
    print("Fixing Lessons...")
    for l in session.exec(select(Lesson)).all():
        l.title = fix_text(l.title)
        
    print("Fixing Flashcards...")
    for f in session.exec(select(Flashcard)).all():
        f.front = fix_text(f.front)
        f.back = fix_text(f.back)
        f.hint = fix_text(f.hint)
        
    print("Fixing Courses...")
    for c in session.exec(select(Course)).all():
        c.title = fix_text(c.title)
        c.description = fix_text(c.description)
        
    print("Fixing Modules...")
    for m in session.exec(select(Module)).all():
        m.title = fix_text(m.title)
        m.description = fix_text(m.description)

    session.commit()
    print("All fixed!")
