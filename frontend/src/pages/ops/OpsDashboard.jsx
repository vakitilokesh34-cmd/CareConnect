import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckSquare, Users, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const OpsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/bookings'),
      ]);
      if (sRes.data.success) setStats(sRes.data.data.stats || sRes.data.data);
      if (bRes.data.success) setBookings(bRes.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to load ops data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading operations dashboard..." />;

  const activeJobs = bookings.filter((b) => !['COMPLETED', 'CUSTOMER_CONFIRMED', 'CANCELLED'].includes(b.status));

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl border border-amber-500/20">
        <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
          Operations Control Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Operations Manager Dashboard</h1>
        <p className="text-xs text-slate-300">Monitor live job execution, manual provider assignments, and quality SLA metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active In-Progress Jobs</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{activeJobs.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed Jobs</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CUSTOMER_CONFIRMED').length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completion SLA Rate</span>
            <span className="text-2xl font-extrabold text-indigo-600 font-display">96.8%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;
