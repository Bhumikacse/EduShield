from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.database import get_db
from backend.app.models.models import Student, Prediction, Intervention
from backend.app.schemas.student import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_students = db.query(func.count(Student.student_id)).scalar()
    
    # We'll approximate risk distribution by looking at the latest prediction for each student.
    # For SQLite MVP, a simple subquery or just reading all latest is fine.
    
    # Subquery: get max prediction_id per student to find their latest
    subquery = db.query(func.max(Prediction.prediction_id)).group_by(Prediction.student_id)
    latest_preds = db.query(Prediction).filter(Prediction.prediction_id.in_(subquery)).all()
    
    high = 0
    medium = 0
    low = 0
    increasing = 0
    
    for p in latest_preds:
        if p.risk_level == "HIGH":
            high += 1
        elif p.risk_level == "MEDIUM":
            medium += 1
        else:
            low += 1
            
        # Simplified trajectory check for increasing
        if p.risk_level in ["HIGH", "MEDIUM"]: # Mocking trajectory if not in DB directly
             increasing += 1
             
    # Active interventions (status != COMPLETED/CANCELLED)
    active_interventions = db.query(func.count(Intervention.intervention_id))\
                             .filter(Intervention.status.not_in(["COMPLETED", "CANCELLED"])).scalar()
                             
    # If no predictions generated yet, we might want to return 0s
    # but let's just return what we have.
                             
    return DashboardStats(
        total_students=total_students or 0,
        high_risk=high,
        medium_risk=medium,
        low_risk=low,
        increasing_risk=increasing // 2, # Just a mock heuristic if no trajectory is saved
        active_interventions=active_interventions or 0
    )
