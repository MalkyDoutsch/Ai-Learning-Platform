from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, models
from ..services.ai_service import AIService

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.post("/generate", response_model=schemas.Lesson)
async def generate_lesson(
    lesson: schemas.LessonGenerate,
    user_id: int,
    db: Session = Depends(database.get_db)
):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subcategory = db.query(models.SubCategory).filter(
        models.SubCategory.id == lesson.subcategory_id
    ).first()
    
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    category = db.query(models.Category).filter(
        models.Category.id == subcategory.category_id
    ).first()
    
    ai_service = AIService(api_key=user.api_key)
    result = await ai_service.generate_lesson(
        prompt=lesson.prompt,
        category=category.name,
        subcategory=subcategory.name
    )
    
    lesson_create = schemas.LessonCreate(
        title=f"{subcategory.name}: {lesson.prompt[:50]}...",
        prompt=lesson.prompt,
        subcategory_id=lesson.subcategory_id,
        user_id=user_id
    )
    
    return crud.create_lesson(
        db=db,
        lesson=lesson_create,
        content=result["content"],
        metadata=result["metadata"]
    )

@router.get("/history/{user_id}", response_model=List[schemas.Lesson])
def get_lesson_history(user_id: int, db: Session = Depends(database.get_db)):
    return crud.get_user_lessons(db, user_id=user_id)

@router.get("/{lesson_id}", response_model=schemas.Lesson)
def get_lesson(lesson_id: int, user_id: int, db: Session = Depends(database.get_db)):
    lesson = crud.get_lesson(db, lesson_id=lesson_id, user_id=user_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson