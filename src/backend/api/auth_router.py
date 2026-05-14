from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from src.backend import config
from src.backend.auth import create_access_token, get_password_hash, verify_password
from src.backend.database import get_session
from src.backend.models import User, Role, Profile
from src.backend.schemas.auth import Token, UserCreate
from src.backend.services.rate_limit_service import rate_limit

router = APIRouter(prefix="/api/auth", tags=["auth"])

ALLOWED_ROLES = {"student", "teacher", "admin"}


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    role_name = (user_data.role or "student").strip().lower()
    if role_name not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid user role.")

    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use.")

    # Find role by name
    role_stmt = select(Role).where(Role.name == role_name)
    role = session.exec(role_stmt).first()
    if not role:
        # Fallback create role if not exists (for dev convenience)
        role = Role(name=role_name)
        session.add(role)
        session.flush()

    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role_id=role.id,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # Create profile automatically
    profile = Profile(user_id=new_user.id)
    session.add(profile)
    session.commit()
    
    return {"message": "Registration successful", "user_id": new_user.id}


@router.post("/login", response_model=Token)
async def login(
    _: None = Depends(rate_limit("login", config.LOGIN_RATE_LIMIT)),
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
    
    role_name = (user.role.name if user.role else "student").lower()
    return {"access_token": access_token, "token_type": "bearer", "role": role_name}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=config.AUTH_COOKIE_NAME,
        path="/",
        secure=config.AUTH_COOKIE_SECURE,
        samesite=config.AUTH_COOKIE_SAMESITE,
    )
    return {"message": "Logged out"}
