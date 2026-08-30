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
- **Database**: PostgreSQL

## Repository Structure
- `/frontend`: React web application
- `/backend`: FastAPI backend and REST API
- `/ml`: Machine learning pipelines and notebooks
- `/database`: Database schemas and seed data
- `/docs`: Architecture and decision documentation
- `/scripts`: Utility scripts

## Local Development
*(To be populated as components are implemented)*

## Future Roadmap
- State-level and Pan-India education intelligence
- Advanced intervention recommendation models
- Automated data ingestion from LMS/ERP
- Fairness/bias monitoring infrastructure
