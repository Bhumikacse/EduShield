import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_students():
    response = client.get("/students?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_student_detail():
    response = client.get("/students/STU0001")
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "STU0001"
    assert "metrics" in data

def test_student_risk_prediction():
    response = client.get("/students/STU0001/risk")
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 1
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "risk_factors" in data

def test_student_risk_history():
    response = client.get("/students/STU0001/risk/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_dashboard_stats():
    response = client.get("/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_students" in data
    assert data["total_students"] > 0

def test_create_intervention():
    payload = {
        "student_id": "STU0001",
        "intervention_type": "ACADEMIC_MENTORING",
        "priority": "HIGH",
        "assigned_counselor": "Counselor Jane",
        "counselor_notes": "Follow up on attendance."
    }
    response = client.post("/interventions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ACTIVE"
    assert "intervention_id" in data
    
    # Store intervention ID for next test
    pytest.intervention_id = data["intervention_id"]

def test_get_interventions():
    response = client.get("/interventions/student/STU0001")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["intervention_type"] == "ACADEMIC_MENTORING"

def test_create_outcome():
    payload = {
        "outcome_status": "IMPROVED",
        "outcome_notes": "Student attended all classes this week."
    }
    # Using the intervention_id from previous test
    response = client.post(f"/interventions/{pytest.intervention_id}/outcome", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_counseling_request():
    payload = {
        "student_id": "STU0001",
        "reason": "Feeling overwhelmed with coursework",
        "preferred_time": "Friday afternoon"
    }
    response = client.post("/counseling/request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert "request_id" in data
