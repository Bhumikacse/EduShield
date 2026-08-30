import pandas as pd
import numpy as np
import os
import random

def generate_synthetic_data(num_students=2000):
    np.random.seed(42)
    random.seed(42)

    # 1. Generate Students
    student_ids = [f"STU{str(i).zfill(4)}" for i in range(1, num_students + 1)]
    departments = ["Computer Science", "Mechanical", "Civil", "Electrical", "Business"]
    
    # 15% overall withdrawal rate
    withdrawal_flag = np.random.choice([0, 1], size=num_students, p=[0.85, 0.15])
    
    hidden_intent = withdrawal_flag.copy()
    
    # Introduce label noise (flip 15% of targets) to prevent perfect separability
    noise_mask = np.random.rand(num_students) < 0.15
    withdrawal_flag[noise_mask] = 1 - withdrawal_flag[noise_mask]
    
    students_data = {
        "student_id": student_ids,
        "name": [f"Student {i}" for i in range(1, num_students + 1)],
        "college": ["Engineering College A"] * num_students,
        "department": np.random.choice(departments, num_students),
        "degree": ["B.Tech"] * num_students,
        "year": np.random.choice([1, 2, 3, 4], num_students),
        "semester": np.random.choice([1, 2], num_students),
        "enrollment_year": 2023,
        "target_withdrawal": withdrawal_flag
    }
    
    df_students = pd.DataFrame(students_data)
    
    # Generate Metrics
    metrics_data = []
    
    for i, row in df_students.iterrows():
        # Retrieve the original intent before noise for generating realistic feature distributions
        is_withdrawing = hidden_intent[i]
        
        # Base distributions with noise
        prev_gpa = np.clip(np.random.normal(3.0, 0.6), 1.0, 4.0)
        prev_att = np.clip(np.random.normal(82, 12), 40, 100)
        prev_assign = np.clip(np.random.normal(78, 15), 0, 100)
        prev_lms = int(np.clip(np.random.normal(45, 20), 0, 100))
        
        # We will add significant noise so the model isn't trivially 100% accurate.
        # "Some high-risk students can still have relatively good GPA"
        # "Some low-risk students can have poor GPA but improving trajectories"
        
        if is_withdrawing:
            # Mostly deteriorating, but with a chance of just being stable-poor or even surprisingly good
            scenario = np.random.choice(['typical_decline', 'high_gpa_low_attendance', 'sudden_drop'], p=[0.7, 0.15, 0.15])
            
            if scenario == 'typical_decline':
                curr_gpa = np.clip(prev_gpa - np.random.uniform(0.1, 0.8), 0.0, 4.0)
                curr_att = np.clip(prev_att - np.random.uniform(5, 25), 0, 100)
            elif scenario == 'high_gpa_low_attendance':
                curr_gpa = np.clip(prev_gpa + np.random.uniform(-0.1, 0.2), 2.5, 4.0)
                curr_att = np.clip(prev_att - np.random.uniform(20, 40), 0, 60)
            else: # sudden_drop
                prev_gpa = np.clip(np.random.normal(3.5, 0.3), 2.0, 4.0)
                curr_gpa = np.clip(prev_gpa - np.random.uniform(1.0, 2.0), 0.0, 4.0)
                curr_att = np.clip(prev_att - np.random.uniform(10, 40), 0, 100)
                
            curr_assign = np.clip(prev_assign - np.random.uniform(5, 30), 0, 100)
            curr_lms = int(np.clip(prev_lms - np.random.uniform(5, 25), 0, 100))
            failed = np.random.randint(0, 4)
            backlogs = np.random.randint(0, 3)
            
        else:
            # Mostly stable/improving, but with a chance of poor stats that didn't lead to dropout
            scenario = np.random.choice(['stable_good', 'poor_but_improving', 'noisy_dip'], p=[0.7, 0.15, 0.15])
            
            if scenario == 'stable_good':
                curr_gpa = np.clip(prev_gpa + np.random.uniform(-0.2, 0.3), 1.0, 4.0)
                curr_att = np.clip(prev_att + np.random.uniform(-5, 5), 60, 100)
            elif scenario == 'poor_but_improving':
                prev_gpa = np.clip(np.random.normal(2.0, 0.5), 1.0, 2.5)
                curr_gpa = np.clip(prev_gpa + np.random.uniform(0.2, 1.0), 1.0, 4.0)
                curr_att = np.clip(prev_att + np.random.uniform(5, 20), 50, 100)
            else: # noisy_dip
                curr_gpa = np.clip(prev_gpa - np.random.uniform(0.1, 0.5), 1.0, 4.0)
                curr_att = np.clip(prev_att - np.random.uniform(5, 15), 50, 100)
                
            curr_assign = np.clip(prev_assign + np.random.uniform(-15, 15), 20, 100)
            curr_lms = int(np.clip(prev_lms + np.random.uniform(-15, 15), 10, 100))
            failed = np.random.choice([0, 1, 2], p=[0.8, 0.15, 0.05])
            backlogs = np.random.choice([0, 1, 2], p=[0.9, 0.08, 0.02])
            
        metrics_data.append({
            "student_id": row["student_id"],
            "measurement_period": "Fall 2025",
            "current_gpa": round(curr_gpa, 2),
            "previous_gpa": round(prev_gpa, 2),
            "failed_subjects": failed,
            "backlogs": backlogs,
            "current_attendance": round(curr_att, 1),
            "previous_attendance": round(prev_att, 1),
            "assignment_completion": round(curr_assign, 1),
            "previous_assignment_completion": round(prev_assign, 1),
            "lms_activity": curr_lms,
            "previous_lms_activity": prev_lms
        })
        
    df_metrics = pd.DataFrame(metrics_data)
    
    # Introduce some realistic missing values
    mask = np.random.rand(num_students) < 0.03
    df_metrics.loc[mask, 'previous_gpa'] = np.nan
    mask2 = np.random.rand(num_students) < 0.02
    df_metrics.loc[mask2, 'previous_attendance'] = np.nan
    
    os.makedirs('ml/data/raw', exist_ok=True)
    df_students.to_csv('ml/data/raw/students.csv', index=False)
    df_metrics.to_csv('ml/data/raw/student_metrics.csv', index=False)
    
    print(f"Generated {num_students} student records.")
    print(f"Withdrawal rate: {df_students['target_withdrawal'].mean():.2%}")

if __name__ == "__main__":
    generate_synthetic_data(2500)
