import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Clock, DollarSign, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SupportDashboard = () => {
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
      console.error('Failed to fetch support disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading support dashboard..." />;

  const openDisputes = disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl border border-rose-500/20">
        <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full">
          Customer Support Agent Desk
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Support Agent Portal</h1>
        <p className="text-xs text-slate-300">Handle customer complaints, arbitrate disputes, and issue refund approvals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Disputes</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{openDisputes.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Resolved Disputes</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {disputes.filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED').length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Resolution Speed SLA</span>
            <span className="text-2xl font-extrabold text-indigo-600 font-display">&lt; 4 hrs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
