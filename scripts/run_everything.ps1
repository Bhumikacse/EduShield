$ErrorActionPreference = "Stop"

echo "Running data generation..."
python scripts/generate_data.py

echo "Building features..."
python ml/src/features/build_features.py

echo "Training models and evaluating..."
python ml/src/models/train.py

echo "Testing explainer..."
python ml/src/explainability/explainer.py

echo "Pipeline complete."
