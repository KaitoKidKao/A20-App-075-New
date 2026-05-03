from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from src.backend.database import get_session
from src.backend.models.user import User
from src.backend.auth import get_password_hash, verify_password, create_access_token
from src.backend.schemas.auth import UserCreate, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    # Kiểm tra email tồn tại
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng.")
    
    # Tạo user mới
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "Đăng ký thành công", "user_id": new_user.id}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role
    }
