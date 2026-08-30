from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.models.models import Student, StudentMetric, Prediction
from backend.app.schemas.student import StudentBase, StudentDetail, StudentPortalDetail, RiskPrediction, StudentMetric as MetricSchema
from backend.app.services.risk_service import generate_prediction
from backend.app.services.recommendation_service import get_recommendations

router = APIRouter()

@router.get("/", response_model=List[StudentBase])
def list_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = db.query(Student).offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}", response_model=StudentDetail)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).all()
    latest_prediction = db.query(Prediction).filter(Prediction.student_id == student_id).order_by(Prediction.prediction_date.desc()).first()
    
    # Map metrics
    metric_schemas = [MetricSchema.model_validate(m) for m in metrics]
    
    pred_schema = None
    if latest_prediction:
        # Calculate trajectory manually for historical prediction if not stored, 
        # but MVP schema has 'trajectory' in the API spec, let's derive it or fetch it.
        # Actually our schema RiskPrediction has trajectory. Our Prediction model doesn't store trajectory.
        # Let's map it roughly.
        pred_schema = RiskPrediction(
            student_id=latest_prediction.student_id,
            risk_score=latest_prediction.risk_score,
            risk_level=latest_prediction.risk_level,
            trajectory="STABLE", # Fallback
            prediction_horizon=latest_prediction.prediction_horizon,
            risk_factors=latest_prediction.risk_factors or [],
            protective_factors=latest_prediction.protective_factors or [],
            model_version=latest_prediction.model_version,
            prediction_date=latest_prediction.prediction_date
        )
        
    return StudentDetail(
        student_id=student.student_id,
        name=student.name,
        college=student.college,
        department=student.department,
        degree=student.degree,
        year=student.year,
        semester=student.semester,
        enrollment_year=student.enrollment_year,
        metrics=metric_schemas,
        latest_prediction=pred_schema
    )

@router.get("/{student_id}/portal", response_model=StudentPortalDetail)
def get_student_portal(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).all()
    metric_schemas = [MetricSchema.model_validate(m) for m in metrics]
    
    return StudentPortalDetail(
        student_id=student.student_id,
        name=student.name,
        college=student.college,
        department=student.department,
        degree=student.degree,
        year=student.year,
        semester=student.semester,
        enrollment_year=student.enrollment_year,
        metrics=metric_schemas
    )

@router.get("/{student_id}/risk", response_model=RiskPrediction)
def get_student_risk(student_id: str, db: Session = Depends(get_db)):
    try:
        prediction = generate_prediction(db, student_id)
        return prediction
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/{student_id}/risk/history")
def get_risk_history(student_id: str, db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    history = db.query(Prediction).filter(Prediction.student_id == student_id).order_by(Prediction.prediction_date.asc()).all()
    
    return [
        {
            "date": p.prediction_date.isoformat(),
            "risk_score": p.risk_score,
            "risk_level": p.risk_level
        } for p in history
    ]

@router.get("/{student_id}/recommendations")
def get_student_recommendations(student_id: str, db: Session = Depends(get_db)):
    # Get latest prediction
    latest_prediction = db.query(Prediction).filter(Prediction.student_id == student_id).order_by(Prediction.prediction_date.desc()).first()
    if not latest_prediction:
        raise HTTPException(status_code=404, detail="No risk prediction available for recommendations")
        
    factors = latest_prediction.risk_factors or []
    recommendations = get_recommendations(factors)
    return {"recommendations": recommendations}
