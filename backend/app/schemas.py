from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    api_key: Optional[str] = None

class User(UserBase):
    id: int
    api_key: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: str

class CategoryCreate(CategoryBase):
    pass

class SubCategoryBase(BaseModel):
    name: str
    description: str
    category_id: int

class SubCategoryCreate(SubCategoryBase):
    pass

class SubCategory(SubCategoryBase):
    id: int
    
    class Config:
        from_attributes = True

class Category(CategoryBase):
    id: int
    subcategories: List[SubCategory] = []
    
    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    prompt: str
    subcategory_id: int

class LessonCreate(LessonBase):
    user_id: int

class LessonGenerate(BaseModel):
    prompt: str
    subcategory_id: int

class Lesson(LessonBase):
    id: int
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True