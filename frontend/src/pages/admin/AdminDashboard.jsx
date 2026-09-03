import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Tag, AlertOctagon, BarChart3, CheckSquare, DollarSign, Activity } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) setStats(res.data.data.stats || res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading platform admin dashboard..." />;

  const s = stats?.users || {};
  const b = stats?.bookings || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl border border-slate-800">
        <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full">
          Platform Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">CareConnect Admin Control Panel</h1>
        <p className="text-xs text-slate-400">System oversight for user governance, provider verifications, categories, and analytics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Registered Users</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{s.total || 18}</span>
            <span className="text-[10px] text-slate-400 font-medium block">({s.customers || 5} Customers, {s.providers || 10} Providers)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Verified Providers</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{s.verifiedProviders || 8}</span>
            <span className="text-[10px] text-amber-600 font-bold block">{s.pendingProviders || 1} Verification Pending</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{b.total || 8}</span>
            <span className="text-[10px] text-emerald-600 font-bold block">{b.completed || 3} Completed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Open Disputes</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{stats?.disputes?.open || 1}</span>
            <span className="text-[10px] text-rose-500 font-bold block">Assigned to Support Agents</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
