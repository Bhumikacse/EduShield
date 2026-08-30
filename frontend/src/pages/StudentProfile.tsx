import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { StudentDetail, RiskPrediction, Intervention } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { InterventionModal } from '../components/InterventionModal';

export function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [risk, setRisk] = useState<RiskPrediction | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      const studentData = await api.getStudent(id);
      setStudent(studentData);
      
      const [riskData, historyData, recsData, interventionsData] = await Promise.all([
        api.getStudentRisk(id).catch(() => null),
        api.getStudentRiskHistory(id).catch(() => []),
        api.getStudentRecommendations(id).catch(() => ({ recommendations: [] })),
        api.getStudentInterventions(id).catch(() => [])
      ]);
      
      setRisk(riskData);
      
      // Format history for chart
      const formattedHistory = historyData.map(h => ({
        date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(h.risk_score * 100)
      }));
      setHistory(formattedHistory);
      
      setRecommendations(recsData.recommendations);
      setInterventions(interventionsData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md border border-red-200">
        {error || 'Student not found.'}
        <div className="mt-4">
          <Link to="/counselor" className="text-red-900 underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const latestMetrics = student.metrics[0];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {student.degree} {student.department} • {student.college} • Year {student.year}, Sem {student.semester}
            </p>
            <p className="text-xs text-gray-400 mt-1">ID: {student.student_id}</p>
          </div>
          
          {risk && (
            <div className="text-right flex flex-col items-end">
              <div className="text-5xl font-bold text-gray-900">
                {Math.round(risk.risk_score * 100)}%
              </div>
              <RiskBadge level={risk.risk_level} className="mt-2 text-sm px-3 py-1" />
              <div className="mt-2 flex items-center text-sm font-medium text-gray-600">
                {risk.trajectory === 'INCREASING' && <span className="text-red-500 mr-1">↑</span>}
                {risk.trajectory === 'DECREASING' && <span className="text-green-500 mr-1">↓</span>}
                {risk.trajectory === 'STABLE' && <span className="text-gray-400 mr-1">→</span>}
                <span className="capitalize">{risk.trajectory.toLowerCase()} Risk</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Academic & Trajectory */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Risk Trajectory Chart */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Predicted Risk Trajectory</h2>
            {history.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                Not enough historical data to map trajectory.
              </div>
            )}
          </div>

          {/* Academic Overview */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Academic Overview</h2>
            {latestMetrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Current GPA</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{latestMetrics.current_gpa?.toFixed(2) || 'N/A'}</div>
                  <div className={`mt-1 text-xs font-medium ${(latestMetrics.current_gpa || 0) >= (latestMetrics.previous_gpa || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    vs {latestMetrics.previous_gpa?.toFixed(2) || 'N/A'} prev
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Attendance</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{latestMetrics.current_attendance?.toFixed(0) || 0}%</div>
                  <div className={`mt-1 text-xs font-medium ${(latestMetrics.current_attendance || 0) >= (latestMetrics.previous_attendance || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    vs {latestMetrics.previous_attendance?.toFixed(0) || 0}% prev
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Assignments</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{latestMetrics.assignment_completion?.toFixed(0) || 0}%</div>
                  <div className={`mt-1 text-xs font-medium ${(latestMetrics.assignment_completion || 0) >= (latestMetrics.previous_assignment_completion || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    vs {latestMetrics.previous_assignment_completion?.toFixed(0) || 0}% prev
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">LMS Activity</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{latestMetrics.lms_activity || 0}</div>
                  <div className={`mt-1 text-xs font-medium ${(latestMetrics.lms_activity || 0) >= (latestMetrics.previous_lms_activity || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    vs {latestMetrics.previous_lms_activity || 0} prev
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent metrics available.</p>
            )}
          </div>
        </div>

        {/* Right Column: SHAP Factors & Interventions */}
        <div className="space-y-8">
          
          {/* Why at risk? */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Why is this student at risk?</h2>
            {risk?.risk_factors && risk.risk_factors.length > 0 ? (
              <div className="space-y-4">
                {risk.risk_factors.map((factor, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-100 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">🔴</span>
                        <span className="font-medium text-gray-900 capitalize">{factor.factor.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                        {factor.impact} IMPACT
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      This metric is showing a pattern associated with elevated dropout risk.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No high-impact risk factors identified.</p>
            )}

            {risk?.protective_factors && risk.protective_factors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Positive Signals</h3>
                <ul className="space-y-2">
                  {risk.protective_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span className="capitalize">{factor.factor.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommended Support */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Support</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 capitalize">{rec.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-1 rounded">RECOMMENDED</span>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-brand-600 shadow-sm text-sm font-medium rounded-md text-brand-600 bg-white hover:bg-brand-50"
                    >
                      Create Intervention
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">No specific recommendations generated.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
                >
                  Create Custom Intervention
                </button>
              </div>
            )}
          </div>

          {/* Intervention History */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Intervention History</h2>
            </div>
            
            {interventions.length > 0 ? (
              <div className="space-y-4">
                {interventions.map((inv) => (
                  <div key={inv.intervention_id} className="border-l-4 border-brand-500 pl-4 py-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">{inv.intervention_type.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Status: <span className="font-medium">{inv.status}</span> • Counselor: {inv.assigned_counselor}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No previous interventions recorded.</p>
            )}
          </div>

        </div>
      </div>

      <InterventionModal 
        studentId={student.student_id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        recommendedInterventions={recommendations}
      />
    </div>
  );
}
