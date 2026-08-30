import React, { useState } from 'react';
import { InterventionCreate } from '../types';
import { api } from '../services/api';

interface InterventionModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recommendedInterventions: string[];
}

export function InterventionModal({ studentId, isOpen, onClose, onSuccess, recommendedInterventions }: InterventionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [type, setType] = useState(recommendedInterventions[0] || 'ACADEMIC_MENTORING');
  const [priority, setPriority] = useState('HIGH');
  const [counselor, setCounselor] = useState('Unassigned');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload: InterventionCreate = {
        student_id: studentId,
        intervention_type: type,
        priority: priority,
        assigned_counselor: counselor,
        follow_up_date: date ? new Date(date).toISOString() : new Date().toISOString(),
        counselor_notes: notes
      };
      
      await api.createIntervention(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create intervention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create Intervention</h3>
              
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intervention Type</label>
                  <select 
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    <option value="ACADEMIC_MENTORING">Academic Mentoring</option>
                    <option value="ATTENDANCE_SUPPORT">Attendance Support</option>
                    <option value="REMEDIAL_SUPPORT">Remedial Support</option>
                    <option value="COUNSELING_SESSION">Counseling Session</option>
                    <option value="CAREER_GUIDANCE">Career Guidance</option>
                  </select>
                  {recommendedInterventions.includes(type) && (
                    <p className="mt-1 text-xs text-brand-600">★ Recommended for this student</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Counselor</label>
                  <input 
                    type="text" 
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={counselor}
                    onChange={e => setCounselor(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                  <input 
                    type="date" 
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea 
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide context for this intervention..."
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Intervention'}
              </button>
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
