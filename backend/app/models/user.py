from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=False, index=True)
    password = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to prompts
    prompts = relationship("Prompt", back_populates="user", cascade="all, delete-orphan")