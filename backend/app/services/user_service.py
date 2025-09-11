from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User
from app.models.prompt import Prompt
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema, UserWithPrompts

def create_user(db: Session, user_data: UserCreate) -> UserSchema:
    existing_user = db.query(User).filter(User.phone == user_data.phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already exists"
        )
    db_user = User(**user_data.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> UserSchema:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    for user in users:
        prompt_count = db.query(func.count(Prompt.id)).filter(Prompt.user_id == user.id).scalar()
        user_with_prompts = UserWithPrompts(
            id=user.id,
            name=user.name,
            phone=user.phone,
            created_at=user.created_at,
            prompt_count=prompt_count
        )
        result.append(user_with_prompts)
    return result

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user