import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CounselingRequestResponse } from '../types';
import { CounselingModal } from '../components/CounselingModal';
import { MessageSquare, Calendar, BookOpen, Clock, User } from 'lucide-react';

const DEMO_STUDENT_ID = 'STU0001';

export function StudentSupport() {
  const [requests, setRequests] = useState<CounselingRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const loadRequests = async () => {
    try {
      const data = await api.getCounselingRequests(DEMO_STUDENT_ID);
      setRequests(data);
    } catch (err: any) {
      setError('Failed to load counseling history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSuccess = () => {
    setShowSuccessMessage(true);
    loadRequests();
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading support data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support & Counseling</h1>
        <p className="mt-1 text-sm text-gray-500">
          Access resources and request counseling sessions.
        </p>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center">
          <p className="font-medium">Counseling request submitted successfully. A counselor will review your request and contact you shortly.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Your Counseling Requests</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Request Counseling
              </button>
            </div>

            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>You haven't requested any counseling sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.request_id} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{req.reason.split(' - Note:')[0]}</h3>
                        {req.reason.includes(' - Note:') && (
                          <p className="mt-1 text-sm text-gray-600 italic">
                            "{req.reason.split(' - Note:')[1]}"
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Requested on: {new Date(req.created_at).toLocaleDateString()}
                          </span>
                          {req.preferred_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Preferred: {new Date(req.preferred_time).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resources</h2>
            <div className="space-y-4">
              <a href="#" className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div className="flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-brand-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Academic Mentoring</p>
                  <p className="text-xs text-gray-500 mt-1">Connect with peer tutors and teaching assistants.</p>
                </div>
              </a>
              <a href="#" className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-brand-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Time Management</p>
                  <p className="text-xs text-gray-500 mt-1">Workshops and templates to organize your semester.</p>
                </div>
              </a>
              <a href="#" className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div className="flex-shrink-0">
                  <User className="h-5 w-5 text-brand-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Career Guidance</p>
                  <p className="text-xs text-gray-500 mt-1">Plan your career trajectory and get resume feedback.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <CounselingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={DEMO_STUDENT_ID}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
