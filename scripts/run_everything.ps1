$ErrorActionPreference = "Stop"

echo "Running data generation..."
.\conda_env\python.exe scripts/generate_data.py

echo "Building features..."
.\conda_env\python.exe ml/src/features/build_features.py

echo "Training models and evaluating..."
.\conda_env\python.exe ml/src/models/train.py

echo "Testing explainer..."
.\conda_env\python.exe ml/src/explainability/explainer.py

echo "Pipeline complete."
