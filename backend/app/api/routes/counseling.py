from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.models import Student, CounselingRequest
from backend.app.schemas.student import CounselingRequestCreate, CounselingRequestResponse

router = APIRouter()

@router.post("/request", response_model=CounselingRequestResponse)
def request_counseling(request: CounselingRequestCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db_request = CounselingRequest(
        student_id=request.student_id,
        reason=request.reason,
        preferred_time=request.preferred_time,
        status="PENDING"
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request

@router.get("/student/{student_id}", response_model=list[CounselingRequestResponse])
def get_student_counseling_requests(student_id: str, db: Session = Depends(get_db)):
    requests = db.query(CounselingRequest).filter(CounselingRequest.student_id == student_id).order_by(CounselingRequest.created_at.desc()).all()
    return requests
