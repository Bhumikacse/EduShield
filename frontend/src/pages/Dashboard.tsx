import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats, StudentBase, RiskPrediction } from '../types';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';

interface StudentWithRisk extends StudentBase {
  risk?: RiskPrediction;
  loading: boolean;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<StudentWithRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Basic filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const statsData = await api.getDashboardStats();
        setStats(statsData);
        
        // Fetch students (limit for MVP demo performance)
        const allStudents = await api.getStudents();
        const initialList = allStudents.slice(0, 15).map(s => ({ ...s, loading: true }));
        setStudents(initialList);
        
        // Load risk profiles in background
        const withRisks = await Promise.all(
          initialList.map(async (student) => {
            try {
              const risk = await api.getStudentRisk(student.student_id);
              return { ...student, risk, loading: false };
            } catch (err) {
              return { ...student, risk: undefined, loading: false };
            }
          })
        );
        
        // Sort by risk score descending
        withRisks.sort((a, b) => (b.risk?.risk_score || 0) - (a.risk?.risk_score || 0));
        setStudents(withRisks);
        
      } catch (err) {
        setError('Failed to load dashboard data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudents = students.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.student_id.toLowerCase().includes(search.toLowerCase())) return false;
    if (riskFilter && s.risk?.risk_level !== riskFilter) return false;
    return true;
  });

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Success Center</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor early warning signals and coordinate timely support.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard title="Total Students" value={stats.total_students} />
          <KPICard title="High Risk" value={stats.high_risk} />
          <KPICard title="Medium Risk" value={stats.medium_risk} />
          <KPICard title="Low Risk" value={stats.low_risk} />
          <KPICard title="Increasing Risk" value={stats.increasing_risk} />
          <KPICard title="Active Interventions" value={stats.active_interventions} />
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900">Priority Students</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search student..." 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
            >
              <option value="">All Risks</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Factor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const primaryFactor = student.risk?.risk_factors?.[0]?.factor.replace(/_/g, ' ') || 'Unknown';
                
                return (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.student_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.degree} {student.department}</div>
                      <div className="text-xs text-gray-500">Year {student.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.loading ? (
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                      ) : student.risk ? (
                        <RiskBadge level={student.risk.risk_level} />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {!student.loading && student.risk ? `${(student.risk.risk_score * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!student.loading && student.risk ? (
                        <span className="flex items-center gap-1">
                          {student.risk.trajectory === 'INCREASING' && <span className="text-red-500 font-bold">↑</span>}
                          {student.risk.trajectory === 'DECREASING' && <span className="text-green-500 font-bold">↓</span>}
                          {student.risk.trajectory === 'STABLE' && <span className="text-gray-400 font-bold">→</span>}
                          <span className="capitalize">{student.risk.trajectory.toLowerCase()}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {!student.loading && student.risk ? primaryFactor : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/counselor/students/${student.student_id}`}
                        className="text-brand-600 hover:text-brand-900 border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
