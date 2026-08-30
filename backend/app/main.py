from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

app = FastAPI(
    title="EduShield API",
    description="Backend API for EduShield: AI-Based College Dropout Prediction & Counseling System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from backend.app.api.routes import students, dashboard, interventions, counseling

# Include API Routers
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(interventions.router, prefix="/interventions", tags=["Interventions"])
app.include_router(counseling.router, prefix="/counseling", tags=["Counseling"])
