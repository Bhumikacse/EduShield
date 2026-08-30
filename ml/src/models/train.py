import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

def train_models(data_path='ml/data/processed/features.csv', artifacts_dir='ml/artifacts'):
    print("Loading processed data...")
    df = pd.read_csv(data_path)
    
    # Define target and features
    target_col = 'target_withdrawal'
    
    # Identify feature types
    exclude_cols = ['student_id', 'name', 'target_withdrawal', 'measurement_period']
    feature_cols = [c for c in df.columns if c not in exclude_cols]
    
    numeric_features = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = df[feature_cols].select_dtypes(exclude=[np.number]).columns.tolist()
    
    print(f"Numeric features: {len(numeric_features)}")
    print(f"Categorical features: {len(categorical_features)}")
    
    X = df[feature_cols]
    y = df[target_col]
    
    # Train/Test Split (Temporal split if we had multiple years, but for MVP random split)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
        
    models = {
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced'),
        'Random Forest': RandomForestClassifier(random_state=42, class_weight='balanced'),
        'XGBoost': XGBClassifier(random_state=42, eval_metric='logloss', scale_pos_weight=(len(y_train)-sum(y_train))/sum(y_train))
    }
    
    results = []
    best_f1 = 0
    best_model_name = ""
    best_pipeline = None
    
    print("\n--- Model Training & Evaluation ---")
    for name, model in models.items():
        pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                 ('classifier', model)])
        
        # Train
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred)
        
        results.append({
            'Model': name,
            'Precision': round(prec, 3),
            'Recall': round(rec, 3),
            'F1': round(f1, 3),
            'ROC-AUC': round(auc, 3)
        })
        
        print(f"\n{name}:")
        print(f"Precision: {prec:.3f} | Recall: {rec:.3f} | F1: {f1:.3f} | ROC-AUC: {auc:.3f}")
        print(f"Confusion Matrix:\n{cm}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline
            
    results_df = pd.DataFrame(results)
    print("\n--- Summary ---")
    print(results_df.to_string(index=False))
    print(f"\nBest Model selected based on F1: {best_model_name}")
    
    # Save best model
    os.makedirs(artifacts_dir, exist_ok=True)
    model_path = f"{artifacts_dir}/model_v1.pkl"
    joblib.dump(best_pipeline, model_path)
    
    # Save test data for SHAP testing later
    X_test.to_csv(f"{artifacts_dir}/X_test_sample.csv", index=False)
    
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_models()
