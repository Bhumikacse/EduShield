import joblib
import pandas as pd
import numpy as np
import json
import os
from explainability.explainer import generate_explanations, parse_risk_factors

def get_risk_level(score):
    # Prototyping Thresholds
    if score >= 0.70:
        return "HIGH"
    elif score >= 0.40:
        return "MEDIUM"
    return "LOW"

def mock_trajectory(current_score):
    # Since MVP doesn't have temporal prediction history in DB yet,
    # we just generate a mock trajectory based on current score to fulfill contract.
    if current_score >= 0.70:
        return "INCREASING"
    elif current_score <= 0.30:
        return "IMPROVING"
    return "STABLE"

def predict_risk(student_data_dict, model_path='ml/artifacts/model_v1.pkl'):
    pipeline = joblib.load(model_path)
    df_sample = pd.DataFrame([student_data_dict])
    
    # Extract student ID and drop non-features if present
    student_id = df_sample.get('student_id', ['UNKNOWN'])[0]
    exclude_cols = ['student_id', 'name', 'target_withdrawal', 'measurement_period']
    feature_cols = [c for c in df_sample.columns if c not in exclude_cols]
    
    X = df_sample[feature_cols]
    
    # Predict
    prob = pipeline.predict_proba(X)[0][1]
    risk_level = get_risk_level(prob)
    trajectory = mock_trajectory(prob)
    
    # SHAP Explainability
    # To get feature names after OneHotEncoding, we need to extract them from preprocessor
    preprocessor = pipeline.named_steps['preprocessor']
    num_features = preprocessor.transformers_[0][2]
    cat_features = preprocessor.transformers_[1][1].get_feature_names_out(preprocessor.transformers_[1][2])
    all_features = list(num_features) + list(cat_features)
    
    try:
        shap_values, _ = generate_explanations(pipeline, X, all_features)
        risk_factors, protective_factors = parse_risk_factors(shap_values[0], all_features)
    except Exception as e:
        print(f"Explainability warning: {e}")
        risk_factors, protective_factors = [], []
        
    result = {
        "student_id": student_id,
        "risk_score": round(prob, 4),
        "risk_level": risk_level,
        "trajectory": trajectory,
        "risk_factors": risk_factors,
        "protective_factors": protective_factors,
        "prediction_horizon": "NEXT_ACADEMIC_PERIOD",
        "model_version": "v1"
    }
    
    return result

if __name__ == "__main__":
    # Test with sample if possible
    try:
        sample_df = pd.read_csv('ml/artifacts/X_test_sample.csv').head(1)
        sample_dict = sample_df.to_dict(orient='records')[0]
        sample_dict['student_id'] = 'STU_TEST'
        print(json.dumps(predict_risk(sample_dict), indent=2))
    except Exception as e:
        print(f"Could not run test prediction: {e}")
