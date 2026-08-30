import sys
import os

# Add src to python path so explainability can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from features.build_features import build_features
from models.train import train_models
import predict

def main():
    print("=== 1. Generating Data (Already Done via scripts) ===")
    
    print("\n=== 2. Feature Engineering ===")
    build_features()
    
    print("\n=== 3. Training Models ===")
    train_models()
    
    print("\n=== 4. Testing Prediction Service ===")
    print("Sample output:")
    import pandas as pd
    import json
    
    try:
        sample_df = pd.read_csv('ml/artifacts/X_test_sample.csv').head(1)
        sample_dict = sample_df.to_dict(orient='records')[0]
        sample_dict['student_id'] = 'STU_PIPELINE_TEST'
        res = predict.predict_risk(sample_dict)
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Error testing prediction: {e}")

if __name__ == "__main__":
    main()
