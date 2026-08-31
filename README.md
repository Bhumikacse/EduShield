# EduShield

**AI-Based College Dropout Prediction & Counseling System**

## Product
EduShield identifies college students showing an elevated risk of permanent withdrawal or non-enrollment. 
- **Problem**: Counselors often discover students are struggling only after it's too late to intervene.
- **Solution**: A predictive and explainable early-warning system that surfaces at-risk students and recommends actionable interventions.
- **Target Users**: College Counselors, Academic Advisors, and Students.

## Core Workflow
`Student Data` → `Risk Prediction` → `Counselor Explanation` → `Intervention` → `Student Support` → `Counseling` → `Follow-up`

## Current MVP
This hackathon MVP includes:
- College-level student monitoring
- Dropout-risk prediction with Low/Medium/High classification
- Risk trajectory indicators (increasing/stable/decreasing)
- Explainable risk signals (SHAP factors)
- Counselor dashboard
- Student risk profile
- Intervention recommendation and creation
- Intervention follow-up and outcome tracking
- Student support portal
- Counseling requests

## Machine Learning
- **Random Forest** is the selected model for the MVP.
- Logistic Regression and XGBoost were evaluated during the development phase.
- **SHAP** is used to generate counselor-facing explanations for risk factors.
- The training data used for this prototype is **synthetic/demo data**.
- Model metrics are outputted during the training script execution (`ml/src/models/train.py`). There is no separate `model_validation.md` for this MVP.

## Database
SQLite is used for the hackathon MVP to minimize infrastructure complexity.

## Setup Instructions

**Python Version Requirement**: Python 3.10+

### 1. Backend & ML Setup
Open a terminal in the project root (`EduShield/`):
```powershell
# Create and activate virtual environment
python -m venv backend/venv
.\backend\venv\Scripts\activate

# Install requirements for backend and ML
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Initialize and seed the SQLite database (MUST be run from project root)
python -m backend.app.db.init_db
python scripts/generate_predictions.py

# Start the FastAPI server
uvicorn backend.app.main:app --reload
```
The backend will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup
Open a second terminal in the `frontend/` directory:
```powershell
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Limitations
- **Synthetic Data**: The system operates on synthetic demo data, not real student records.
- **Prototype Thresholds**: Risk classification thresholds (LOW/MEDIUM/HIGH) are prototype estimates.
- **No Production Authentication**: The MVP uses simplified roles for demonstration purposes.
- **No Real Institutional Integration**: The system does not yet ingest live data from an LMS or ERP.

## Future Roadmap
- Multi-college analytics
- State-level dashboard
- National education intelligence
- Institutional integrations (LMS/ERP direct pipelines)
- Production authentication and role-based access control (RBAC)
- Larger real-world datasets for model validation
