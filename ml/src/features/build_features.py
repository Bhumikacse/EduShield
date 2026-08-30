import pandas as pd
import numpy as np
import os

def build_features(raw_data_dir='ml/data/raw', processed_data_dir='ml/data/processed'):
    print("Building features...")
    df_students = pd.read_csv(f"{raw_data_dir}/students.csv")
    df_metrics = pd.read_csv(f"{raw_data_dir}/student_metrics.csv")
    
    # Merge datasets
    df = pd.merge(df_students, df_metrics, on='student_id', how='inner')
    
    # 1. Feature Engineering: Trajectories
    # GPA Change
    df['gpa_change'] = df['current_gpa'] - df['previous_gpa']
    # Attendance Change
    df['attendance_change'] = df['current_attendance'] - df['previous_attendance']
    # Assignment Change
    df['assignment_change'] = df['assignment_completion'] - df['previous_assignment_completion']
    # LMS Activity Change
    df['lms_change'] = df['lms_activity'] - df['previous_lms_activity']
    
    # Trajectory categorical bins (for explainability / simple rules)
    def categorize_trend(change, threshold=0.1):
        if pd.isna(change): return 'UNKNOWN'
        if change > threshold: return 'IMPROVING'
        if change < -threshold: return 'DETERIORATING'
        return 'STABLE'

    df['gpa_trend'] = df['gpa_change'].apply(lambda x: categorize_trend(x, 0.1))
    df['attendance_trend'] = df['attendance_change'].apply(lambda x: categorize_trend(x, 2.0))
    df['engagement_trend'] = df['assignment_change'].apply(lambda x: categorize_trend(x, 5.0))
    
    # 2. Handle missing values transparently
    # For numeric features, we will fill with median to avoid dropping rows
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_cols.remove('target_withdrawal') # Don't touch target
    if 'student_id' in numeric_cols: numeric_cols.remove('student_id')
    
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"Imputed missing values in {col} with median: {median_val}")
    
    # Check for leakage
    leakage_cols = ['future_gpa', 'final_withdrawal_status', 'post_intervention']
    for c in leakage_cols:
        if c in df.columns:
            print(f"WARNING: Possible data leakage column found and removed: {c}")
            df.drop(columns=[c], inplace=True)
            
    # Save processed data
    os.makedirs(processed_data_dir, exist_ok=True)
    df.to_csv(f"{processed_data_dir}/features.csv", index=False)
    
    print(f"Feature engineering complete. Output shape: {df.shape}")
    return df

if __name__ == "__main__":
    build_features()
