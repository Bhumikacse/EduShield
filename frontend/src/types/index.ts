export interface RiskFactor {
  factor: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  direction: 'INCREASES_RISK' | 'REDUCES_RISK';
}

export interface RiskPrediction {
  student_id: string;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  trajectory: string;
  prediction_horizon: string;
  risk_factors: RiskFactor[];
  protective_factors: RiskFactor[];
  model_version: string;
  prediction_date: string;
}

export interface StudentMetric {
  measurement_period: string;
  current_gpa: number;
  previous_gpa: number;
  current_attendance: number;
  previous_attendance: number;
  assignment_completion: number;
  previous_assignment_completion: number;
  lms_activity: number;
  previous_lms_activity: number;
}

export interface StudentBase {
  student_id: string;
  name: string;
  college: string;
  department: string;
  degree: string;
  year: number;
  semester: number;
  enrollment_year: number;
}

export interface StudentPortalDetail extends StudentBase {
  metrics: StudentMetric[];
}

export interface StudentDetail extends StudentBase {
  metrics: StudentMetric[];
  latest_prediction?: RiskPrediction;
}

export interface DashboardStats {
  total_students: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  increasing_risk: number;
  active_interventions: number;
}

export interface Intervention {
  intervention_id: number;
  student_id: string;
  intervention_type: string;
  priority: string;
  assigned_counselor: string;
  status: string;
  follow_up_date: string;
  created_at: string;
  counselor_notes?: string;
}

export interface InterventionCreate {
  student_id: string;
  intervention_type: string;
  priority: string;
  assigned_counselor: string;
  follow_up_date: string;
  counselor_notes: string;
}

export interface CounselingRequestCreate {
  student_id: string;
  reason: string;
  preferred_time?: string;
}

export interface CounselingRequestResponse extends CounselingRequestCreate {
  request_id: number;
  status: string;
  created_at: string;
}
