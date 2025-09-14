from pydantic import BaseModel, validator, EmailStr
from datetime import datetime
from typing import Optional, List
import re

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: str
    phone: Optional[str] = None

    @validator('username')
    def username_must_be_valid(cls, v):
        if not v.strip():
            raise ValueError('Username cannot be empty')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not re.match(r'^[a-zA-Z0-9_-]+, v):
            raise ValueError('Username can only contain letters, numbers, hyphens, and underscores')
        return v.strip().lower()

    @validator('full_name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        # Basic phone validation
        phone_pattern = r'^[\+]?[1-9][\d]{0,15}
        if not re.match(phone_pattern, v.replace(' ', '').replace('-', '')):
            raise ValueError('Invalid phone number format')
        return v.replace(' ', '').replace('-', '')

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

    @validator('full_name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip() if v else v

    @validator('password')
    def validate_password(cls, v):
        if v is not None:
            if len(v) < 6:
                raise ValueError('Password must be at least 6 characters long')
            if not re.search(r'[A-Za-z]', v):
                raise ValueError('Password must contain at least one letter')
            if not re.search(r'\d', v):
                raise ValueError('Password must contain at least one number')
        return v

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserWithPrompts(User):
    prompt_count: Optional[int] = 0

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: str
    phone: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True