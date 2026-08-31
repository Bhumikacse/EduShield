import { DashboardStats, StudentBase, StudentDetail, RiskPrediction, Intervention, InterventionCreate, OutcomeCreate } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}`, error);
    throw error;
  }
}

export const api = {
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard/stats'),

  getStudents: () => fetchJson<StudentBase[]>('/students'),

  getStudent: (id: string) => fetchJson<StudentDetail>(`/students/${id}`),

  getStudentPortalDetails: (id: string) => fetchJson<any>(`/students/${id}/portal`),

  getStudentRisk: (id: string) => fetchJson<RiskPrediction>(`/students/${id}/risk`),

  getStudentRiskHistory: (id: string) => fetchJson<any[]>(`/students/${id}/risk/history`),

  getStudentRecommendations: (id: string) => fetchJson<{ recommendations: string[] }>(`/students/${id}/recommendations`),

  getStudentInterventions: (id: string) => fetchJson<Intervention[]>(`/interventions/student/${id}`),

  createIntervention: (payload: InterventionCreate) =>
    fetchJson<Intervention>('/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  createOutcome: (interventionId: number, payload: OutcomeCreate) =>
    fetchJson<{ status: string; outcome_id: number }>(`/interventions/${interventionId}/outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  createCounselingRequest: (payload: any) =>
    fetchJson<any>('/counseling/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getCounselingRequests: (id: string) => fetchJson<any[]>(`/counseling/student/${id}`)
};
