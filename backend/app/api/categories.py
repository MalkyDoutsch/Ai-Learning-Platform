from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(database.get_db)):
    return crud.get_categories(db)

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    return crud.create_category(db=db, category=category)

@router.get("/{category_id}/subcategories", response_model=List[schemas.SubCategory])
def read_subcategories(category_id: int, db: Session = Depends(database.get_db)):
    return crud.get_subcategories(db, category_id=category_id)

@router.post("/subcategories", response_model=schemas.SubCategory)
def create_subcategory(subcategory: schemas.SubCategoryCreate, db: Session = Depends(database.get_db)):
    return crud.create_subcategory(db=db, subcategory=subcategory)