-- Initial Database Schema for EduShield

CREATE TABLE students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    college VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    degree VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    enrollment_year INT NOT NULL
);

CREATE TABLE student_metrics (
    student_id VARCHAR(50) REFERENCES students(student_id),
    measurement_period VARCHAR(50) NOT NULL,
    current_gpa DECIMAL(3,2),
    previous_gpa DECIMAL(3,2),
    failed_subjects INT,
    backlogs INT,
    current_attendance DECIMAL(5,2),
    previous_attendance DECIMAL(5,2),
    assignment_completion DECIMAL(5,2),
    previous_assignment_completion DECIMAL(5,2),
    lms_activity INT,
    previous_lms_activity INT,
    PRIMARY KEY (student_id, measurement_period)
);

CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    risk_score DECIMAL(5,4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prediction_horizon VARCHAR(50),
    risk_factors JSONB,
    protective_factors JSONB,
    model_version VARCHAR(50)
);

CREATE TABLE interventions (
    intervention_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    intervention_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    assigned_counselor VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    follow_up_date TIMESTAMP,
    counselor_notes TEXT
);

CREATE TABLE counseling_requests (
    request_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferred_time VARCHAR(100)
);

CREATE TABLE outcomes (
    outcome_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    intervention_id INT REFERENCES interventions(intervention_id),
    outcome_status VARCHAR(50) NOT NULL,
    risk_score_after DECIMAL(5,4),
    attendance_after DECIMAL(5,2),
    academic_performance_after DECIMAL(5,2),
    engagement_after INT,
    outcome_notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
