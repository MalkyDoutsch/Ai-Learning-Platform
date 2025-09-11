from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class PromptBase(BaseModel):
    prompt: str

    @validator('prompt')
    def prompt_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Prompt cannot be empty')
        return v.strip()

class PromptCreate(PromptBase):
    user_id: int
    category_id: int
    sub_category_id: int

class PromptUpdate(BaseModel):
    response: Optional[str] = None

class Prompt(PromptBase):
    id: int
    user_id: int
    category_id: int
    sub_category_id: int
    response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PromptWithDetails(Prompt):
    user_name: Optional[str] = None
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None

    class Config:
        from_attributes = True

class AILessonRequest(BaseModel):
    topic: str
    prompt: str
    category: Optional[str] = None
    sub_category: Optional[str] = None

    @validator('topic', 'prompt')
    def fields_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class AILessonResponse(BaseModel):
    lesson: str
    topic: str
    success: bool = True