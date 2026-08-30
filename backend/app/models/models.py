from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    college = Column(String, nullable=False)
    department = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    enrollment_year = Column(Integer, nullable=False)
    
    metrics = relationship("StudentMetric", back_populates="student")
    predictions = relationship("Prediction", back_populates="student")
    interventions = relationship("Intervention", back_populates="student")
    counseling_requests = relationship("CounselingRequest", back_populates="student")

class StudentMetric(Base):
    __tablename__ = "student_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    measurement_period = Column(String, nullable=False)
    
    current_gpa = Column(Float)
    previous_gpa = Column(Float)
    failed_subjects = Column(Integer)
    backlogs = Column(Integer)
    
    current_attendance = Column(Float)
    previous_attendance = Column(Float)
    
    assignment_completion = Column(Float)
    previous_assignment_completion = Column(Float)
    
    lms_activity = Column(Integer)
    previous_lms_activity = Column(Integer)

    student = relationship("Student", back_populates="metrics")

class Prediction(Base):
    __tablename__ = "predictions"
    
    prediction_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    prediction_date = Column(DateTime(timezone=True), server_default=func.now())
    prediction_horizon = Column(String)
    risk_factors = Column(JSON)
    protective_factors = Column(JSON)
    model_version = Column(String)
    
    student = relationship("Student", back_populates="predictions")

class Intervention(Base):
    __tablename__ = "interventions"
    
    intervention_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    intervention_type = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    assigned_counselor = Column(String)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    follow_up_date = Column(DateTime(timezone=True))
    counselor_notes = Column(Text)
    
    student = relationship("Student", back_populates="interventions")
    outcomes = relationship("Outcome", back_populates="intervention")

class CounselingRequest(Base):
    __tablename__ = "counseling_requests"
    
    request_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    preferred_time = Column(String)
    
    student = relationship("Student", back_populates="counseling_requests")

class Outcome(Base):
    __tablename__ = "outcomes"
    
    outcome_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.intervention_id"))
    outcome_status = Column(String, nullable=False)
    risk_score_after = Column(Float)
    attendance_after = Column(Float)
    academic_performance_after = Column(Float)
    engagement_after = Column(Integer)
    outcome_notes = Column(Text)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    intervention = relationship("Intervention", back_populates="outcomes")
