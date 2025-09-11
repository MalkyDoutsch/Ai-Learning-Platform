from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.category import Category, SubCategory
from app.schemas.category import (
    Category as CategorySchema,
    CategoryWithSubCategories,
    SubCategory as SubCategorySchema,
    CategoryCreate,
    SubCategoryCreate
)

router = APIRouter()

@router.get("/", response_model=List[CategoryWithSubCategories])
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories with their subcategories"""
    categories = db.query(Category).all()
    result = []
    
    for category in categories:
        sub_categories = db.query(SubCategory).filter(
            SubCategory.category_id == category.id
        ).all()
        
        category_with_subs = CategoryWithSubCategories(
            id=category.id,
            name=category.name,
            created_at=category.created_at,
            sub_categories=sub_categories
        )
        result.append(category_with_subs)
    
    return result

@router.get("/{category_id}", response_model=CategoryWithSubCategories)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category with its subcategories"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    sub_categories = db.query(SubCategory).filter(
        SubCategory.category_id == category_id
    ).all()
    
    return CategoryWithSubCategories(
        id=category.id,
        name=category.name,
        created_at=category.created_at,
        sub_categories=sub_categories
    )

@router.get("/{category_id}/subcategories/", response_model=List[SubCategorySchema])
async def get_subcategories(category_id: int, db: Session = Depends(get_db)):
    """Get all subcategories for a specific category"""
    # Verify category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    sub_categories = db.query(SubCategory).filter(
        SubCategory.category_id == category_id
    ).all()
    
    return sub_categories

@router.post("/", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    # Check if category name already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.post("/subcategories/", response_model=SubCategorySchema, status_code=status.HTTP_201_CREATED)
async def create_subcategory(subcategory: SubCategoryCreate, db: Session = Depends(get_db)):
    """Create a new subcategory"""
    # Verify parent category exists
    category = db.query(Category).filter(Category.id == subcategory.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent category not found"
        )
    
    # Check if subcategory name already exists in this category
    existing_subcategory = db.query(SubCategory).filter(
        SubCategory.name == subcategory.name,
        SubCategory.category_id == subcategory.category_id
    ).first()
    if existing_subcategory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subcategory with this name already exists in this category"
        )
    
    db_subcategory = SubCategory(**subcategory.dict())
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory
    