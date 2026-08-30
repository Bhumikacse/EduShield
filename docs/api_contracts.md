# API Contracts

The EduShield backend is built using FastAPI. As a result, the API contracts are automatically generated and self-documented using OpenAPI standards.

## Accessing the API Documentation
When the local backend server is running (e.g., via `uvicorn backend.app.main:app --reload`), you can view and test the API contracts interactively by navigating to:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Key Endpoints

### Students & Risk Predictions
- `GET /students` - List all students (paginated).
- `GET /students/{student_id}` - Retrieve a specific student's profile and metrics.
- `GET /students/{student_id}/risk` - Retrieve the student's current dropout risk score, risk level (LOW/MEDIUM/HIGH), and the key factors contributing to that risk (via SHAP).

### Dashboard
- `GET /dashboard/stats` - Retrieve aggregate statistics for the counselor dashboard (e.g., total students, high-risk count, recent interventions).

### Interventions
- `GET /interventions/student/{student_id}` - Get history of interventions for a student.
- `POST /interventions` - Create a new intervention plan.
- `POST /interventions/{intervention_id}/outcome` - Log an outcome or follow-up for an existing intervention.

### Counseling
- `POST /counseling/request` - Allow a student to request a counseling session.

## Data Schemas
All data sent and received adheres strictly to Pydantic models defined in `backend/app/schemas/student.py`. Refer to those models or the auto-generated Swagger UI for exact field definitions, requirements, and constraints.
