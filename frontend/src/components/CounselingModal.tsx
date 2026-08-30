import { useState } from 'react';
import { CounselingRequestCreate } from '../types';
import { api } from '../services/api';

interface CounselingModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CounselingModal({ studentId, isOpen, onClose, onSuccess }: CounselingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [reason, setReason] = useState('Academic difficulty');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload: CounselingRequestCreate = {
        student_id: studentId,
        reason: reason,
        preferred_time: preferredTime || undefined
      };
      
      // Optionally we can append message to reason if backend doesn't support message directly
      if (message) {
        payload.reason = `${reason} - Note: ${message}`;
      }
      
      await api.createCounselingRequest(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Request Counseling</h3>
              
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <select 
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  >
                    <option value="Academic difficulty">Academic difficulty</option>
                    <option value="Attendance concerns">Attendance concerns</option>
                    <option value="Career guidance">Career guidance</option>
                    <option value="Difficulty managing workload">Difficulty managing workload</option>
                    <option value="Financial/support concerns">Financial/support concerns</option>
                    <option value="Personal/well-being support">Personal/well-being support</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred time (Optional)</label>
                  <input 
                    type="datetime-local" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Optional message</label>
                  <textarea 
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Briefly describe what you'd like to discuss..."
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
                {loading ? 'Submitting...' : 'Submit Request'}
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
