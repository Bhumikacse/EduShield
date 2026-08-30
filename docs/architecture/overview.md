# Architecture Overview

## Modular Monolith
EduShield uses a modular monolith architecture. We separate logic into distinct modules (students, predictions, interventions, etc.) but deploy them together via a single FastAPI backend. This avoids the complexity of microservices for the hackathon MVP while maintaining clean boundaries.

## Components
- **React Frontend**: A Vite-powered SPA serving distinct views for Counselors and Students.
- **FastAPI Backend**: Exposes REST endpoints for the frontend, connecting to the database and invoking the ML engine for predictions.
- **ML/Risk Engine**: Python-based models built with XGBoost and scikit-learn. The model takes in student metrics, predicts risk, and uses SHAP to provide explainability.
- **PostgreSQL Database**: Relational datastore for all entities.

## Data Flow
Student Metrics → Feature Engineering → ML Risk Engine → Risk Score & Classification → Explainability → Backend → Counselor Dashboard → Intervention → Student Support → Follow-up → Outcome

## Security Boundaries
- **Counselor Role**: Full access to individual student risk, risk factors, intervention history, and notes.
- **Student Role**: Restricted access. Can only view their own progress, support plan, and counseling requests. The raw numerical risk probability is hidden from the student.
