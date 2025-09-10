from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import auth, categories, lessons
from . import crud, schemas, database
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Learning Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        # Create default categories if they don't exist
        if not crud.get_categories(db):
            default_categories = [
                {"name": "Programming", "description": "Learn various programming languages and concepts"},
                {"name": "Data Science", "description": "Master data analysis and machine learning"},
                {"name": "Web Development", "description": "Build modern web applications"},
                {"name": "Mathematics", "description": "Explore mathematical concepts and theories"},
                {"name": "Language Learning", "description": "Learn new languages and improve communication"}
            ]
            
            for cat_data in default_categories:
                cat = crud.create_category(db, schemas.CategoryCreate(**cat_data))
                
                # Add subcategories
                if cat.name == "Programming":
                    subcats = [
                        {"name": "Python", "description": "Learn Python programming"},
                        {"name": "JavaScript", "description": "Master JavaScript"},
                        {"name": "Java", "description": "Java programming fundamentals"}
                    ]
                elif cat.name == "Data Science":
                    subcats = [
                        {"name": "Machine Learning", "description": "ML algorithms and techniques"},
                        {"name": "Data Analysis", "description": "Analyze data effectively"},
                        {"name": "Deep Learning", "description": "Neural networks and AI"}
                    ]
                elif cat.name == "Web Development":
                    subcats = [
                        {"name": "Frontend", "description": "HTML, CSS, and JavaScript"},
                        {"name": "Backend", "description": "Server-side development"},
                        {"name": "Full Stack", "description": "Complete web applications"}
                    ]
                elif cat.name == "Mathematics":
                    subcats = [
                        {"name": "Calculus", "description": "Differential and integral calculus"},
                        {"name": "Linear Algebra", "description": "Vectors and matrices"},
                        {"name": "Statistics", "description": "Statistical analysis and probability"}
                    ]
                else:  # Language Learning
                    subcats = [
                        {"name": "Spanish", "description": "Learn Spanish language"},
                        {"name": "French", "description": "Master French language"},
                        {"name": "German", "description": "German language fundamentals"}
                    ]
                
                for subcat_data in subcats:
                    crud.create_subcategory(
                        db, 
                        schemas.SubCategoryCreate(
                            **subcat_data,
                            category_id=cat.id
                        )
                    )
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Learning Platform API", "version": "1.0.0"}