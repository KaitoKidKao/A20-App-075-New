from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from src.backend.database import get_session
from src.backend.models.user import User
from src.backend.auth import get_current_user
from src.backend.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/api/users", tags=["User Management"])

@router.get("/me", response_model=UserRead)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Lấy thông tin cá nhân của người dùng hiện tại"""
    return current_user

@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cập nhật thông tin cá nhân (Họ tên)"""
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserRead])
async def list_users(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Liệt kê danh sách người dùng (Chỉ dành cho Admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thực hiện hành động này."
        )
    
    statement = select(User)
    users = session.exec(statement).all()
    return users

@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Xóa một người dùng (Chỉ dành cho Admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thực hiện hành động này."
        )
    
    user_to_delete = session.get(User, user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    
    if user_to_delete.role == "admin":
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản Admin.")

    session.delete(user_to_delete)
    session.commit()
    return {"message": f"Đã xóa người dùng {user_id} thành công."}
