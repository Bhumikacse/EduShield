import shap
import pandas as pd
import numpy as np

def generate_explanations(pipeline, X_sample, feature_names):
    """
    Generate SHAP values using the classifier from the pipeline.
    Because pipeline transforms the input, we must transform X_sample first.
    """
    preprocessor = pipeline.named_steps['preprocessor']
    classifier = pipeline.named_steps['classifier']
    
    # Transform input
    X_transformed = preprocessor.transform(X_sample)
    
    # Use TreeExplainer if tree-based, else Kernel/Linear Explainer
    try:
        explainer = shap.TreeExplainer(classifier)
        shap_values = explainer.shap_values(X_transformed)
        if isinstance(shap_values, list): # For Random Forest
            shap_values = shap_values[1]
    except Exception:
        # Fallback for Logistic Regression
        explainer = shap.LinearExplainer(classifier, X_transformed)
        shap_values = explainer.shap_values(X_transformed)
        
    return shap_values, X_transformed

def parse_risk_factors(shap_vals, feature_names, top_n=3):
    """
    Convert SHAP values into readable risk/protective factors.
    """
    factors = []
    protective = []
    
    for i, val in enumerate(shap_vals):
        impact_label = "HIGH" if abs(val) > 0.5 else ("MEDIUM" if abs(val) > 0.2 else "LOW")
        if impact_label == "LOW":
            continue
            
        item = {
            "factor": feature_names[i],
            "impact": impact_label
        }
        
        if val > 0:
            item["direction"] = "INCREASES_RISK"
            factors.append((item, abs(val)))
        else:
            item["direction"] = "REDUCES_RISK"
            protective.append((item, abs(val)))
            
    # Sort by impact
    factors.sort(key=lambda x: x[1], reverse=True)
    protective.sort(key=lambda x: x[1], reverse=True)
    
    return [x[0] for x in factors[:top_n]], [x[0] for x in protective[:top_n]]

