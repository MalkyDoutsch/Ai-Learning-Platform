from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.models.prompt import Prompt
from app.models.user import User
from app.models.category import Category, SubCategory
from app.schemas.prompt import (
    Prompt as PromptSchema,
    PromptCreate,
    PromptWithDetails,
    AILessonRequest,
    AILessonResponse
)
from app.services.ai_service import ai_service
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter()

async def generate_ai_response(prompt_id: int, topic: str, prompt_text: str, category_name: str, sub_category_name: str, db: Session):
    """Background task to generate AI response"""
    try:
        ai_response = await ai_service.generate_lesson(
            topic=topic,
            prompt=prompt_text,
            category=category_name,
            sub_category=sub_category_name
        )
        
        # Update the prompt with the AI response
        db_prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if db_prompt:
            db_prompt.response = ai_response
            db.commit()
    
    except Exception as e:
        print(f"Error generating AI response for prompt {prompt_id}: {e}")

@router.post("/", response_model=PromptSchema, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    prompt: PromptCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new prompt and generate AI response"""
    # Verify category exists
    category = db.query(Category).filter(Category.id == prompt.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Verify subcategory exists and belongs to category
    sub_category = db.query(SubCategory).filter(
        SubCategory.id == prompt.sub_category_id,
        SubCategory.category_id == prompt.category_id
    ).first()
    if not sub_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found or doesn't belong to the specified category"
        )
    
    # Create the prompt with current user's ID
    db_prompt = Prompt(
        user_id=current_user.id,
        category_id=prompt.category_id,
        sub_category_id=prompt.sub_category_id,
        prompt=prompt.prompt
    )
    
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    
    # Add background task to generate AI response
    topic = f"{category.name} - {sub_category.name}"
    background_tasks.add_task(
        generate_ai_response,
        db_prompt.id,
        topic,
        prompt.prompt,
        category.name,
        sub_category.name,
        db
    )
    
    return db_prompt

@router.get("/", response_model=List[PromptWithDetails])
async def get_all_prompts(
    skip: int = 0, 
    limit: int = 100, 
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all prompts (admin endpoint) with optional user filtering"""
    query = db.query(
        Prompt.id,
        Prompt.user_id,
        Prompt.category_id,
        Prompt.sub_category_id,
        Prompt.prompt,
        Prompt.response,
        Prompt.created_at,
        User.full_name.label("user_name"),
        Category.name.label("category_name"),
        SubCategory.name.label("sub_category_name")
    ).join(User).join(Category).join(SubCategory)
    
    if user_id:
        query = query.filter(Prompt.user_id == user_id)
    
    prompts = query.order_by(desc(Prompt.created_at)).offset(skip).limit(limit).all()
    
    return [
        PromptWithDetails(
            id=prompt.id,
            user_id=prompt.user_id,
            category_id=prompt.category_id,
            sub_category_id=prompt.sub_category_id,
            prompt=prompt.prompt,
            response=prompt.response,
            created_at=prompt.created_at,
            user_name=prompt.user_name,
            category_name=prompt.category_name,
            sub_category_name=prompt.sub_category_name
        )
        for prompt in prompts
    ]

@router.get("/my-prompts", response_model=List[PromptWithDetails])
async def get_my_prompts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's prompts (learning history)"""
    prompts = db.query(
        Prompt.id,
        Prompt.user_id,
        Prompt.category_id,
        Prompt.sub_category_id,
        Prompt.prompt,
        Prompt.response,
        Prompt.created_at,
        User.full_name.label("user_name"),
        Category.name.label("category_name"),
        SubCategory.name.label("sub_category_name")
    ).join(User).join(Category).join(SubCategory).filter(
        Prompt.user_id == current_user.id
    ).order_by(desc(Prompt.created_at)).offset(skip).limit(limit).all()
    
    return [
        PromptWithDetails(
            id=prompt.id,
            user_id=prompt.user_id,
            category_id=prompt.category_id,
            sub_category_id=prompt.sub_category_id,
            prompt=prompt.prompt,
            response=prompt.response,
            created_at=prompt.created_at,
            user_name=prompt.user_name,
            category_name=prompt.category_name,
            sub_category_name=prompt.sub_category_name
        )
        for prompt in prompts
    ]

@router.get("/users/{user_id}", response_model=List[PromptWithDetails])
async def get_user_prompts(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get prompts for a specific user (admin or own prompts only)"""
    # Users can only view their own prompts, admins can view any user's prompts
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view these prompts"
        )
    
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    prompts = db.query(
        Prompt.id,
        Prompt.user_id,
        Prompt.category_id,
        Prompt.sub_category_id,
        Prompt.prompt,
        Prompt.response,
        Prompt.created_at,
        User.full_name.label("user_name"),
        Category.name.label("category_name"),
        SubCategory.name.label("sub_category_name")
    ).join(User).join(Category).join(SubCategory).filter(
        Prompt.user_id == user_id
    ).order_by(desc(Prompt.created_at)).offset(skip).limit(limit).all()
    
    return [
        PromptWithDetails(
            id=prompt.id,
            user_id=prompt.user_id,
            category_id=prompt.category_id,
            sub_category_id=prompt.sub_category_id,
            prompt=prompt.prompt,
            response=prompt.response,
            created_at=prompt.created_at,
            user_name=prompt.user_name,
            category_name=prompt.category_name,
            sub_category_name=prompt.sub_category_name
        )
        for prompt in prompts
    ]

@router.get("/{prompt_id}", response_model=PromptWithDetails)
async def get_prompt(
    prompt_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific prompt by ID"""
    prompt = db.query(
        Prompt.id,
        Prompt.user_id,
        Prompt.category_id,
        Prompt.sub_category_id,
        Prompt.prompt,
        Prompt.response,
        Prompt.created_at,
        User.full_name.label("user_name"),
        Category.name.label("category_name"),
        SubCategory.name.label("sub_category_name")
    ).join(User).join(Category).join(SubCategory).filter(
        Prompt.id == prompt_id
    ).first()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    
    # Users can only view their own prompts, admins can view any prompt
    if not current_user.is_admin and prompt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this prompt"
        )
    
    return PromptWithDetails(
        id=prompt.id,
        user_id=prompt.user_id,
        category_id=prompt.category_id,
        sub_category_id=prompt.sub_category_id,
        prompt=prompt.prompt,
        response=prompt.response,
        created_at=prompt.created_at,
        user_name=prompt.user_name,
        category_name=prompt.category_name,
        sub_category_name=prompt.sub_category_name
    )

@router.post("/ai/generate-lesson", response_model=AILessonResponse)
async def generate_lesson(
    lesson_request: AILessonRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI lesson directly (for testing purposes)"""
    try:
        lesson = await ai_service.generate_lesson(
            topic=lesson_request.topic,
            prompt=lesson_request.prompt,
            category=lesson_request.category,
            sub_category=lesson_request.sub_category
        )
        
        return AILessonResponse(
            lesson=lesson,
            topic=lesson_request.topic,
            success=True
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating lesson: {str(e)}"
        )

@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a prompt (admin or own prompts only)"""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    
    # Users can only delete their own prompts, admins can delete any prompt
    if not current_user.is_admin and prompt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this prompt"
        )
    
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}