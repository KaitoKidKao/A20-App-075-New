import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.abspath('.'))
from src.backend.database import engine
from sqlmodel import Session, select
from src.backend.models.assessment import Question

with Session(engine) as session:
    q = session.exec(select(Question).limit(1)).first()
    text = q.question_text
    print(f'Original: {repr(text)}')
    try:
        fixed = text.encode('cp1252').decode('utf-8')
        print(f'CP1252 Fixed: {fixed}')
    except Exception as e:
        print(f'CP1252 Error: {e}')
    
    try:
        fixed2 = text.encode('cp437').decode('utf-8')
        print(f'CP437 Fixed: {fixed2}')
    except Exception as e:
        print(f'CP437 Error: {e}')
