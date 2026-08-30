import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StudentPortalDetail, Intervention } from '../types';
import { KPICard } from '../components/KPICard';

const DEMO_STUDENT_ID = 'STU0001';

export function StudentDashboard() {
  const [student, setStudent] = useState<StudentPortalDetail | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, interventionsData] = await Promise.all([
          api.getStudentPortalDetails(DEMO_STUDENT_ID),
          api.getStudentInterventions(DEMO_STUDENT_ID)
        ]);
        setStudent(studentData);
        setInterventions(interventionsData);
      } catch (err: any) {
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  }

  if (error || !student) {
    return <div className="p-8 text-center text-red-500">{error || 'Student not found'}</div>;
  }

  const activeInterventions = interventions.filter(i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED');
  const latestMetrics = student.metrics[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {student.degree} in {student.department}, Year {student.year}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Attendance"
          value={`${latestMetrics?.current_attendance || 0}%`}
          description={latestMetrics ? `Previous: ${latestMetrics.previous_attendance || 0}%` : undefined}
        />
        <KPICard 
          title="Academic Progress"
          value={(latestMetrics?.current_gpa || 0).toFixed(2)}
          description={latestMetrics ? `Previous: ${(latestMetrics.previous_gpa || 0).toFixed(2)}` : undefined}
        />
        <KPICard 
          title="Assignments"
          value={`${latestMetrics?.assignment_completion || 0}%`}
          description={latestMetrics ? `Previous: ${latestMetrics.previous_assignment_completion || 0}%` : undefined}
        />
        <KPICard 
          title="LMS Engagement"
          value={`${latestMetrics?.lms_activity || 0} hrs`}
          description={latestMetrics ? `Previous: ${latestMetrics.previous_lms_activity || 0} hrs` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Areas where you may benefit from support</h2>
            
            <div className="space-y-4">
              {latestMetrics && (latestMetrics.current_attendance || 0) < 75 && (
                <div className="bg-blue-50 p-4 rounded-md flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Attendance Support</h3>
                    <p className="text-sm text-blue-600 mt-1">Your attendance has been lower recently. Let's plan how to catch up.</p>
                  </div>
                  <Link to="/student/support" className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded border border-blue-200 hover:bg-blue-50">
                    Get Help
                  </Link>
                </div>
              )}

              {latestMetrics && (latestMetrics.current_gpa || 0) < 2.5 && (
                <div className="bg-yellow-50 p-4 rounded-md flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Academic Support</h3>
                    <p className="text-sm text-yellow-600 mt-1">Additional academic mentoring might be useful for your current subjects.</p>
                  </div>
                  <Link to="/student/support" className="px-3 py-1 bg-white text-yellow-600 text-sm font-medium rounded border border-yellow-200 hover:bg-yellow-50">
                    View Resources
                  </Link>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center border border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">Personal Support</h3>
                  <p className="text-sm text-gray-600 mt-1">If personal circumstances are affecting your studies, you can speak to a counselor.</p>
                </div>
                <Link to="/student/support" className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100">
                  Request Counseling
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Support Plan</h2>
            
            {activeInterventions.length === 0 ? (
              <p className="text-sm text-gray-500">You have no active support plans right now.</p>
            ) : (
              <div className="space-y-4">
                {activeInterventions.map(intervention => (
                  <div key={intervention.intervention_id} className="border-l-4 border-brand-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {intervention.intervention_type.replace('_', ' ')}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{intervention.status.toLowerCase()}</span>
                      <span>&bull;</span>
                      <span>{intervention.assigned_counselor}</span>
                    </div>
                    {intervention.follow_up_date && (
                      <p className="mt-2 text-xs text-gray-600">
                        Next follow-up: {new Date(intervention.follow_up_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link to="/student/support" className="text-sm text-brand-600 font-medium hover:text-brand-800">
                View all support history &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
