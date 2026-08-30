from backend.app.db.database import SessionLocal
from backend.app.models.models import Student
from backend.app.services.risk_service import generate_prediction


def main():
    db = SessionLocal()

    try:
        students = db.query(Student).all()

        for student in students:
            generate_prediction(
                db,
                student.student_id,
                persist=True
            )

        print(f"Generated predictions for {len(students)} students.")

    finally:
        db.close()


if __name__ == "__main__":
    main()