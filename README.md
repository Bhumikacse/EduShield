# EduShield

**AI-Based College Dropout Prediction & Counseling System**

## Purpose
EduShield identifies college students showing elevated risk of permanent withdrawal or non-enrollment in the next academic period. It provides counselors with explainable risk factors and intervention recommendations, while offering students a supportive interface to track their progress and request counseling.

Core product loop: **Detect → Explain → Intervene → Support → Follow Up**

## MVP Scope
This hackathon MVP includes:
- Student Data & Risk Prediction
- Low/Medium/High Risk Classification
- Explainable Risk Factors
- Counselor Dashboard & Student Profile
- Intervention Management
- Student Support Page & Counseling Requests

*Out of Scope for MVP: Government dashboards, LMS/ERP integrations, Mobile apps.*

## Architecture Overview
EduShield uses a modular monolith architecture suitable for a hackathon:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Python, FastAPI, Pydantic
- **Machine Learning**: Python, scikit-learn, XGBoost, SHAP
- **Database**: SQLite

## Repository Structure
- `/frontend`: React web application
- `/backend`: FastAPI backend and REST API
- `/ml`: Machine learning pipelines and notebooks
- `/database`: Database schemas and seed data
- `/docs`: Architecture and decision documentation
- `/scripts`: Utility scripts

## Setup Instructions & Local Development

This project uses a modular monolith architecture but runs from the project root.

### 1. Backend & ML Setup
Open a terminal in the project root (`EduShield/`):
```powershell
# Create and activate virtual environment (if not already done)
python -m venv backend/venv
.\backend\venv\Scripts\activate

# Install requirements for backend and ML
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Initialize and seed the SQLite database (MUST be run from project root)
python -m backend.app.db.init_db

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

## Future Roadmap
- State-level and Pan-India education intelligence
- Advanced intervention recommendation models
- Automated data ingestion from LMS/ERP
- Fairness/bias monitoring infrastructure
