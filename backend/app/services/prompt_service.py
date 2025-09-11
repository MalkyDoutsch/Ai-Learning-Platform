from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.prompt import Prompt
from app.models.user import User
from app.models.category import Category, SubCategory
from app.schemas.prompt import (
    PromptCreate, PromptUpdate, PromptWithDetails, Prompt as PromptSchema
)
from app.services.ai_service import ai_service

async def create_prompt(db: Session, prompt_data: PromptCreate) -> PromptSchema:
    user = db.query(User).filter(User.id == prompt_data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    category = db.query(Category).filter(Category.id == prompt_data.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    sub_category = db.query(SubCategory).filter(
        SubCategory.id == prompt_data.sub_category_id,
        SubCategory.category_id == prompt_data.category_id
    ).first()
    if not sub_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found or doesn't belong to the specified category"
        )
    db_prompt = Prompt(**prompt_data.dict())
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)

    # Generate AI lesson and update the prompt
    topic = f"{category.name} - {sub_category.name}"
    ai_response = await ai_service.generate_lesson(
        topic=topic,
        prompt=prompt_data.prompt,
        category=category.name,
        sub_category=sub_category.name
    )
    db_prompt.response = ai_response
    db.commit()
    db.refresh(db_prompt)

    return db_prompt

def get_prompt(db: Session, prompt_id: int) -> PromptWithDetails:
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    # Attach details
    user = db.query(User).filter(User.id == prompt.user_id).first()
    category = db.query(Category).filter(Category.id == prompt.category_id).first()
    sub_category = db.query(SubCategory).filter(SubCategory.id == prompt.sub_category_id).first()
    return PromptWithDetails(
        id=prompt.id,
        user_id=prompt.user_id,
        category_id=prompt.category_id,
        sub_category_id=prompt.sub_category_id,
        prompt=prompt.prompt,
        response=prompt.response,
        created_at=prompt.created_at,
        user_name=user.name if user else None,
        category_name=category.name if category else None,
        sub_category_name=sub_category.name if sub_category else None
    )

def get_user_prompts(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[PromptWithDetails]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    prompts = db.query(Prompt).filter(Prompt.user_id == user_id).order_by(Prompt.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for prompt in prompts:
        category = db.query(Category).filter(Category.id == prompt.category_id).first()
        sub_category = db.query(SubCategory).filter(SubCategory.id == prompt.sub_category_id).first()
        results.append(PromptWithDetails(
            id=prompt.id,
            user_id=prompt.user_id,
            category_id=prompt.category_id,
            sub_category_id=prompt.sub_category_id,
            prompt=prompt.prompt,
            response=prompt.response,
            created_at=prompt.created_at,
            user_name=user.name,
            category_name=category.name if category else None,
            sub_category_name=sub_category.name if sub_category else None
        ))
    return results

def get_all_prompts(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[PromptWithDetails]:
    query = db.query(Prompt)
    if user_id:
        query = query.filter(Prompt.user_id == user_id)
    prompts = query.order_by(Prompt.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for prompt in prompts:
        user = db.query(User).filter(User.id == prompt.user_id).first()
        category = db.query(Category).filter(Category.id == prompt.category_id).first()
        sub_category = db.query(SubCategory).filter(SubCategory.id == prompt.sub_category_id).first()
        results.append(PromptWithDetails(
            id=prompt.id,
            user_id=prompt.user_id,
            category_id=prompt.category_id,
            sub_category_id=prompt.sub_category_id,
            prompt=prompt.prompt,
            response=prompt.response,
            created_at=prompt.created_at,
            user_name=user.name if user else None,
            category_name=category.name if category else None,
            sub_category_name=sub_category.name if sub_category else None
        ))
    return results