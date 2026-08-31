import React, { useState } from 'react';
import { Intervention, OutcomeCreate } from '../types';
import { api } from '../services/api';

interface OutcomeModalProps {
  intervention: Intervention;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OutcomeModal({ intervention, isOpen, onClose, onSuccess }: OutcomeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('IMPROVED');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: OutcomeCreate = {
        outcome_status: status,
        outcome_notes: notes || undefined
      };

      await api.createOutcome(intervention.intervention_id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record outcome');
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">Record Outcome / Follow-up</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4 capitalize">
                {intervention.intervention_type.replace(/_/g, ' ').toLowerCase()}
              </p>

              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outcome</label>
                  <select
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="IMPROVED">Improved</option>
                    <option value="PARTIALLY_IMPROVED">Partially improved</option>
                    <option value="NO_CHANGE">No change</option>
                    <option value="WORSENED">Worsened</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Follow-up notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Summarize what happened and any next steps..."
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Recording an outcome marks this intervention as completed.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Outcome'}
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
