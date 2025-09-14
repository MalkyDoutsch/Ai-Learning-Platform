from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.prompt import Prompt
from app.schemas.user import User as UserSchema, UserWithPrompts
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[UserWithPrompts])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users with their prompt counts (Admin only)"""
    users = db.query(
        User.id,
        User.username,
        User.email,
        User.full_name,
        User.phone,
        User.is_active,
        User.is_admin,
        User.created_at,
        User.updated_at,
        func.count(Prompt.id).label("prompt_count")
    ).outerjoin(Prompt).group_by(User.id).offset(skip).limit(limit).all()
    
    return [
        UserWithPrompts(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
            updated_at=user.updated_at,
            prompt_count=user.prompt_count
        )
        for user in users
    ]

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user's information"""
    return current_user

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific user by ID (Admin only or own profile)"""
    # Users can view their own profile, admins can view any profile
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user and all associated prompts (Admin only)"""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}