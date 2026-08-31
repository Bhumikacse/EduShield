import os
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from backend.app.models.models import Student, StudentMetric, Prediction
from backend.app.schemas.student import RiskPrediction, RiskFactor

MODEL_PATH = "ml/artifacts/model_v1.pkl"

# Lazy load model
_model_pipeline = None

def get_model():
    global _model_pipeline
    if _model_pipeline is None:
        if os.path.exists(MODEL_PATH):
            _model_pipeline = joblib.load(MODEL_PATH)
        else:
            raise RuntimeError(f"Model artifact not found at {MODEL_PATH}")
    return _model_pipeline

def categorize_trend(change, threshold=0.1):
    if pd.isna(change): return 'UNKNOWN'
    if change > threshold: return 'IMPROVING'
    if change < -threshold: return 'DETERIORATING'
    return 'STABLE'

def get_risk_trajectory(change):
    if change < -0.1: return "INCREASING"
    if change > 0.1: return "DECREASING"
    return "STABLE"

def generate_prediction(
    db: Session,
    student_id: str,
    persist: bool = False
) -> RiskPrediction:
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise ValueError(f"Student {student_id} not found")
        
    metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).order_by(StudentMetric.measurement_period.desc()).first()
    if not metrics:
        raise ValueError(f"No metrics found for student {student_id}")
        
    pipeline = get_model()
    
    # 1. Prepare features DataFrame
    feature_dict = {
        'college': student.college,
        'department': student.department,
        'degree': student.degree,
        'year': student.year,
        'semester': student.semester,
        'enrollment_year': student.enrollment_year,
        'current_gpa': metrics.current_gpa,
        'previous_gpa': metrics.previous_gpa,
        'failed_subjects': metrics.failed_subjects,
        'backlogs': metrics.backlogs,
        'current_attendance': metrics.current_attendance,
        'previous_attendance': metrics.previous_attendance,
        'assignment_completion': metrics.assignment_completion,
        'previous_assignment_completion': metrics.previous_assignment_completion,
        'lms_activity': metrics.lms_activity,
        'previous_lms_activity': metrics.previous_lms_activity
    }
    
    df = pd.DataFrame([feature_dict])
    
    # Feature Engineering (mimic build_features.py)
    df['gpa_change'] = df['current_gpa'] - df['previous_gpa']
    df['attendance_change'] = df['current_attendance'] - df['previous_attendance']
    df['assignment_change'] = df['assignment_completion'] - df['previous_assignment_completion']
    df['lms_change'] = df['lms_activity'] - df['previous_lms_activity']
    
    df['gpa_trend'] = df['gpa_change'].apply(lambda x: categorize_trend(x, 0.1))
    df['attendance_trend'] = df['attendance_change'].apply(lambda x: categorize_trend(x, 2.0))
    df['engagement_trend'] = df['assignment_change'].apply(lambda x: categorize_trend(x, 5.0))
    
    # Impute missing values with zeros/safe defaults to avoid prediction errors
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    
    # 2. Prediction
    risk_prob = pipeline.predict_proba(df)[0][1]
    risk_score = round(max(0.0, min(1.0, float(risk_prob))), 4)
    
    if risk_score > 0.7:
        risk_level = "HIGH"
    elif risk_score > 0.4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    # 3. SHAP Explainability
    import shap
    preprocessor = pipeline.named_steps['preprocessor']
    classifier = pipeline.named_steps['classifier']
    X_transformed = preprocessor.transform(df)
    
    feature_names = numeric_cols.tolist() + preprocessor.named_transformers_['cat'].get_feature_names_out().tolist()
    
    try:
        explainer = shap.TreeExplainer(classifier)
        shap_values = explainer.shap_values(X_transformed)
        if isinstance(shap_values, list): # RF sometimes returns list
            shap_values = shap_values[1]
    except Exception:
        explainer = shap.LinearExplainer(classifier, X_transformed)
        shap_values = explainer.shap_values(X_transformed)
        
    # Extract SHAP values for the single instance
    # shap_values shape could be (1, n_features, 2) or (1, n_features) or list
    if hasattr(shap_values, "shape") and len(shap_values.shape) == 3:
        shap_vals = shap_values[0, :, 1]  # Class 1 (Dropout risk)
    elif hasattr(shap_values, "shape") and len(shap_values.shape) == 2:
        shap_vals = shap_values[0]
    else:
        shap_vals = shap_values[0] # Fallback
    
    factors = []
    protective = []
    
    FEATURE_LABELS = {
        "gpa_change": "Recent change in GPA",
        "attendance_change": "Recent change in attendance",
        "assignment_change": "Recent change in assignment completion",
        "lms_change": "Recent change in LMS engagement",
        "current_gpa": "Current GPA",
        "current_attendance": "Current Attendance Level",
        "failed_subjects": "Number of failed subjects",
        "backlogs": "Number of active backlogs",
        "assignment_completion": "Assignment completion rate",
        "lms_activity": "LMS activity level",
        "department": "Academic department",
        "degree": "Degree program",
        "year": "Academic year"
    }
    
    for i, val in enumerate(shap_vals):
        impact_label = "HIGH" if abs(val) > 0.05 else ("MEDIUM" if abs(val) > 0.02 else "LOW")
        if impact_label == "LOW":
            continue
            
        # Clean feature name and map to human-readable format
        if i < len(feature_names):
            raw_fname = feature_names[i].replace("num__", "").replace("cat__", "")
        else:
            raw_fname = f"feature_{i}"
        # Remove any one-hot suffix like department_Civil
        clean_fname = raw_fname.split("_")[0] if "department_" in raw_fname else raw_fname
        clean_fname = clean_fname.split("_")[0] if "degree_" in clean_fname else clean_fname
        
        human_name = FEATURE_LABELS.get(clean_fname, clean_fname.replace("_", " ").title())
            
        item = {
            "factor": human_name,
            "impact": impact_label
        }
        
        if val > 0:
            item["direction"] = "INCREASES_RISK"
            factors.append((item, abs(val)))
        else:
            item["direction"] = "REDUCES_RISK"
            protective.append((item, abs(val)))
            
    factors.sort(key=lambda x: x[1], reverse=True)
    protective.sort(key=lambda x: x[1], reverse=True)
    
    top_factors = [RiskFactor(**x[0]) for x in factors[:3]]
    top_protective = [RiskFactor(**x[0]) for x in protective[:3]]
    
    trajectory = get_risk_trajectory(df['gpa_change'].iloc[0])
    
    # 4. Optionally persist a prediction snapshot.
    prediction_date = None

    if persist:
        prediction = Prediction(
            student_id=student_id,
            risk_score=risk_score,
            risk_level=risk_level,
            prediction_horizon="NEXT_ACADEMIC_PERIOD",
            risk_factors=[f.model_dump() for f in top_factors],
            protective_factors=[f.model_dump() for f in top_protective],
            model_version="v1"
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        prediction_date = prediction.prediction_date

    return RiskPrediction(
        student_id=student_id,
        risk_score=risk_score,
        risk_level=risk_level,
        trajectory=trajectory,
        prediction_horizon="NEXT_ACADEMIC_PERIOD",
        risk_factors=top_factors,
        protective_factors=top_protective,
        model_version="v1",
        prediction_date=prediction_date
    )
