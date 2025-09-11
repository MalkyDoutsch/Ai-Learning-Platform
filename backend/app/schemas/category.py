from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SubCategoryBase(BaseModel):
    name: str

class SubCategoryCreate(SubCategoryBase):
    category_id: int

class SubCategory(SubCategoryBase):
    id: int
    category_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryWithSubCategories(Category):
    sub_categories: List[SubCategory] = []

    class Config:
        from_attributes = True