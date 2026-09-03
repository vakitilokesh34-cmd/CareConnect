import React, { useEffect, useState } from 'react';
import { AlertOctagon, CheckCircle2, MessageSquare, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SupportDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);

  // Form state
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/disputes');
      if (res.data.success) setDisputes(res.data.data.disputes || []);
    } catch (err) {
      console.error('Failed to fetch support disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/disputes/${selectedDispute._id}/resolve`, {
        resolution,
        status: newStatus,
      });

      if (res.data.success) {
        alert('Dispute resolution saved successfully!');
        setSelectedDispute(null);
        fetchDisputes();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading support disputes..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Complaints & Disputes Resolution</h1>
        <p className="text-xs text-slate-500 mt-1">Review customer issues and issue binding support resolutions.</p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No active disputes requiring support.
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-bold text-slate-900 text-sm">Issue: {d.reason}</span>
                  <p className="text-[10px] text-slate-400">Raised: {new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 font-bold rounded-full bg-amber-100 text-amber-800 uppercase">
                    {d.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDispute(d);
                      setResolution(d.resolution || '');
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                  >
                    Resolve Dispute
                  </button>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed font-medium">"{d.description}"</p>

              {d.resolution && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
                  <strong>Resolution Note:</strong> {d.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Resolve Dispute</h3>
              <button onClick={() => setSelectedDispute(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispute Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Summary / Decision</label>
                <textarea
                  required
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. Issue resolved. Provider agreed to re-visit customer for touch-up work at zero extra charge."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedDispute(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDisputes;
