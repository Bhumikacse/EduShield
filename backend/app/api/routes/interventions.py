from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.models.models import Student, Intervention, Outcome
from backend.app.schemas.student import InterventionCreate, InterventionResponse, OutcomeCreate

router = APIRouter()

@router.post("/", response_model=InterventionResponse)
def create_intervention(intervention: InterventionCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == intervention.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db_intervention = Intervention(
        student_id=intervention.student_id,
        intervention_type=intervention.intervention_type,
        priority=intervention.priority,
        assigned_counselor=intervention.assigned_counselor,
        status="ACTIVE", # Default status
        follow_up_date=intervention.follow_up_date,
        counselor_notes=intervention.counselor_notes
    )
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    
    return db_intervention

@router.get("/student/{student_id}", response_model=List[InterventionResponse])
def get_student_interventions(student_id: str, db: Session = Depends(get_db)):
    interventions = db.query(Intervention).filter(Intervention.student_id == student_id).order_by(Intervention.created_at.desc()).all()
    return interventions

@router.post("/{intervention_id}/outcome")
def create_outcome(intervention_id: int, outcome: OutcomeCreate, db: Session = Depends(get_db)):
    intervention = db.query(Intervention).filter(Intervention.intervention_id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    db_outcome = Outcome(
        student_id=intervention.student_id,
        intervention_id=intervention_id,
        outcome_status=outcome.outcome_status,
        risk_score_after=outcome.risk_score_after,
        attendance_after=outcome.attendance_after,
        academic_performance_after=outcome.academic_performance_after,
        engagement_after=outcome.engagement_after,
        outcome_notes=outcome.outcome_notes
    )
    
    # Update intervention status if outcome is recorded
    intervention.status = "COMPLETED"
    
    db.add(db_outcome)
    db.commit()
    
    return {"status": "success", "outcome_id": db_outcome.outcome_id}
