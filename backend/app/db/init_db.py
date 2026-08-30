import pandas as pd
from sqlalchemy import inspect
from backend.app.db.database import engine, Base
from backend.app.models.models import *

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have data
    inspector = inspect(engine)
    if inspector.has_table("students"):
        with engine.connect() as conn:
            result = conn.execute(Student.__table__.select().limit(1)).fetchone()
            if result:
                print("Database already seeded.")
                return
                
    print("Seeding database with demo data...")
    try:
        # We need to map NaN to None for SQL insertion
        students_df = pd.read_csv("ml/data/raw/students.csv")
        metrics_df = pd.read_csv("ml/data/raw/student_metrics.csv")
        
        # Don't import the target_withdrawal into the backend students table directly,
        # but the backend needs to know it's synthetic.
        if 'target_withdrawal' in students_df.columns:
            students_df = students_df.drop(columns=['target_withdrawal'])
            
        students_df.to_sql("students", engine, if_exists="append", index=False)
        print(f"Inserted {len(students_df)} students.")
        
        metrics_df.to_sql("student_metrics", engine, if_exists="append", index=False)
        print(f"Inserted {len(metrics_df)} student metrics.")
        
        print("Database seeded successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    init_db()
