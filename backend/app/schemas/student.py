from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RiskFactor(BaseModel):
    factor: str
    impact: str
    direction: Optional[str] = None

class RiskPrediction(BaseModel):
    student_id: str
    risk_score: float
    risk_level: str
    trajectory: str
    prediction_horizon: str
    risk_factors: List[RiskFactor]
    protective_factors: List[RiskFactor]
    model_version: str
    prediction_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentMetric(BaseModel):
    measurement_period: str
    current_gpa: Optional[float] = None
    previous_gpa: Optional[float] = None
    failed_subjects: Optional[int] = None
    backlogs: Optional[int] = None
    current_attendance: Optional[float] = None
    previous_attendance: Optional[float] = None
    assignment_completion: Optional[float] = None
    previous_assignment_completion: Optional[float] = None
    lms_activity: Optional[int] = None
    previous_lms_activity: Optional[int] = None

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    student_id: str
    name: str
    college: str
    department: str
    degree: str
    year: int
    semester: int
    enrollment_year: int

class StudentDetail(StudentBase):
    metrics: List[StudentMetric]
    latest_prediction: Optional[RiskPrediction] = None

    class Config:
        from_attributes = True

class StudentPortalDetail(StudentBase):
    metrics: List[StudentMetric]

    class Config:
        from_attributes = True

class InterventionCreate(BaseModel):
    student_id: str
    intervention_type: str
    priority: str
    assigned_counselor: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    counselor_notes: Optional[str] = None

class OutcomeResponse(BaseModel):
    outcome_id: int
    outcome_status: str
    risk_score_after: Optional[float] = None
    attendance_after: Optional[float] = None
    academic_performance_after: Optional[float] = None
    engagement_after: Optional[int] = None
    outcome_notes: Optional[str] = None
    recorded_at: datetime

    class Config:
        from_attributes = True

class InterventionResponse(InterventionCreate):
    intervention_id: int
    status: str
    created_at: datetime
    outcomes: List[OutcomeResponse] = []

    class Config:
        from_attributes = True

class CounselingRequestCreate(BaseModel):
    student_id: str
    reason: str
    preferred_time: Optional[str] = None

class CounselingRequestResponse(CounselingRequestCreate):
    request_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_students: int
    high_risk: int
    medium_risk: int
    low_risk: int
    increasing_risk: int
    active_interventions: int

class OutcomeCreate(BaseModel):
    outcome_status: str
    risk_score_after: Optional[float] = None
    attendance_after: Optional[float] = None
    academic_performance_after: Optional[float] = None
    engagement_after: Optional[int] = None
    outcome_notes: Optional[str] = None
