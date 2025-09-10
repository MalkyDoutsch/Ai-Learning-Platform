from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional, List

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_api_key(db: Session, user_id: int, api_key: str):
    user = get_user(db, user_id)
    if user:
        user.api_key = api_key
        db.commit()
        db.refresh(user)
    return user

def get_categories(db: Session):
    return db.query(models.Category).all()

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_subcategories(db: Session, category_id: Optional[int] = None):
    query = db.query(models.SubCategory)
    if category_id:
        query = query.filter(models.SubCategory.category_id == category_id)
    return query.all()

def create_subcategory(db: Session, subcategory: schemas.SubCategoryCreate):
    db_subcategory = models.SubCategory(**subcategory.dict())
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

def create_lesson(db: Session, lesson: schemas.LessonCreate, content: str, metadata: dict = None):
    db_lesson = models.Lesson(
        title=lesson.title,
        prompt=lesson.prompt,
        content=content,
        lesson_metadata=metadata,
        user_id=lesson.user_id,
        subcategory_id=lesson.subcategory_id
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_user_lessons(db: Session, user_id: int, limit: int = 100):
    return db.query(models.Lesson).filter(
        models.Lesson.user_id == user_id
    ).order_by(models.Lesson.created_at.desc()).limit(limit).all()

def get_lesson(db: Session, lesson_id: int, user_id: int):
    return db.query(models.Lesson).filter(
        models.Lesson.id == lesson_id,
        models.Lesson.user_id == user_id
    ).first()