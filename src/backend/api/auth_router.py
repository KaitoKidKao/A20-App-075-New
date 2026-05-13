from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from src.backend import config
from src.backend.auth import create_access_token, get_password_hash, verify_password
from src.backend.database import get_session
from src.backend.models import User
from src.backend.schemas.auth import Token, UserCreate

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use.")

    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "Registration successful", "user_id": new_user.id}


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    response: Response = None,
    session: Session = Depends(get_session),
):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    access_token = create_access_token(data={"sub": user.email})
    if response is not None:
        response.set_cookie(
            key=config.AUTH_COOKIE_NAME,
            value=access_token,
            httponly=True,
            secure=config.AUTH_COOKIE_SECURE,
            samesite=config.AUTH_COOKIE_SAMESITE,
            max_age=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=config.AUTH_COOKIE_NAME, path="/")
    return {"message": "Logged out"}
