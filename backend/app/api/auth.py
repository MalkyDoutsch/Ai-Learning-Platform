from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.User)
def login(username: str, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/api-key/{user_id}", response_model=schemas.User)
def update_api_key(user_id: int, api_key: str, db: Session = Depends(database.get_db)):
    user = crud.update_user_api_key(db, user_id=user_id, api_key=api_key)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user