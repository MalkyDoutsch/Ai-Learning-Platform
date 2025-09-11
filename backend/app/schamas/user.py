from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List
import re

class UserBase(BaseModel):
    name: str
    phone: str

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation
        phone_pattern = r'^[\+]?[1-9][\d]{0,15}$'
        if not re.match(phone_pattern, v.replace(' ', '').replace('-', '')):
            raise ValueError('Invalid phone number format')
        return v.replace(' ', '').replace('-', '')

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserWithPrompts(User):
    prompt_count: Optional[int] = 0

    class Config:
        from_attributes = True