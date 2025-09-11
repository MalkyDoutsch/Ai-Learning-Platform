#!/usr/bin/env python3
"""
Seed data script to populate the database with initial categories and subcategories
"""

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.category import Category, SubCategory
from app.models.user import User
from app.models.prompt import Prompt

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_categories():
    """Seed initial categories and subcategories"""
    db = SessionLocal()
    
    try:
        # Check if categories already exist
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print("Categories already exist. Skipping seeding.")
            return
        
        # Define categories and their subcategories
        categories_data = {
            "Science": [
                "Physics", "Chemistry", "Biology", "Space", "Earth Science",
                "Environmental Science", "Mathematics", "Computer Science"
            ],
            "Technology": [
                "Programming", "Web Development", "Mobile Development", 
                "Artificial Intelligence", "Data Science", "Cybersecurity",
                "Cloud Computing", "DevOps"
            ],
            "History": [
                "Ancient History", "Medieval History", "Modern History",
                "World War I", "World War II", "Renaissance", "Industrial Revolution"
            ],
            "Arts": [
                "Painting", "Sculpture", "Music", "Literature", "Theater",
                "Film", "Photography", "Digital Art"
            ],
            "Languages": [
                "English", "Spanish", "French", "German", "Italian",
                "Japanese", "Chinese", "Arabic"
            ],
            "Business": [
                "Marketing", "Finance", "Management", "Entrepreneurship",
                "Economics", "Accounting", "Strategy", "Leadership"
            ],
            "Health & Medicine": [
                "Nutrition", "Exercise", "Mental Health", "Anatomy",
                "Diseases", "Treatments", "Public Health", "Alternative Medicine"
            ],
            "Philosophy": [
                "Ethics", "Logic", "Metaphysics", "Political Philosophy",
                "Ancient Philosophy", "Modern Philosophy", "Eastern Philosophy"
            ]
        }
        
        # Create categories and subcategories
        for category_name, subcategories in categories_data.items():
            # Create category
            category = Category(name=category_name)
            db.add(category)
            db.commit()
            db.refresh(category)
            
            print(f"Created category: {category_name}")
            
            # Create subcategories
            for subcategory_name in subcategories:
                subcategory = SubCategory(
                    name=subcategory_name,
                    category_id=category.id
                )
                db.add(subcategory)
            
            db.commit()
            print(f"  Added {len(subcategories)} subcategories")
        
        print("✅ Categories and subcategories seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

def seed_sample_user():
    """Seed a sample user for testing"""
    db = SessionLocal()
    
    try:
        # Check if sample user already exists
        existing_user = db.query(User).filter(User.phone == "+972501234567").first()
        if existing_user:
            print("Sample user already exists. Skipping.")
            return
        
        # Create sample user
        sample_user = User(
            name="Israel Cohen",
            phone="+972501234567"
        )
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        
        print(f"✅ Sample user created: {sample_user.name} (ID: {sample_user.id})")
        
    except Exception as e:
        print(f"❌ Error creating sample user: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    # Seed categories
    seed_categories()
    
    # Seed sample user
    seed_sample_user()
    
    print("🌱 Database seeding completed!")

if __name__ == "__main__":
    main()