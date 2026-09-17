import React, { useEffect, useState } from 'react';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/disputes');
      if (res.data.success) setDisputes(res.data.data.disputes || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading disputes..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">System Disputes Oversight</h1>
        <p className="text-xs text-slate-500 mt-1">Review all active disputes raised by customers or providers.</p>
      </div>

      {disputes.length === 0 ? (
        <div className="cc-card p-12 text-center rounded-2xl text-slate-400 text-xs">
          No disputes recorded.
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d._id} className="cc-card rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm">Reason: {d.reason}</span>
                <span className="px-2.5 py-1 font-bold rounded-full bg-rose-100 text-rose-800 uppercase">
                  {d.status}
                </span>
              </div>
              <p className="text-slate-600 font-medium">"{d.description}"</p>
              {d.resolution && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-800">
                  <strong>Resolution:</strong> {d.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
