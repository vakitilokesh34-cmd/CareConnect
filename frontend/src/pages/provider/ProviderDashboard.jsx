import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, DollarSign, Star, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        api.get('/providers/profile'),
        api.get('/bookings'),
      ]);
      if (pRes.data.success) setProfile(pRes.data.data.provider || pRes.data.data.user);
      if (bRes.data.success) setBookings(bRes.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to load provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading provider dashboard..." />;

  const activeJobs = bookings.filter((b) => !['COMPLETED', 'CUSTOMER_CONFIRMED', 'CANCELLED'].includes(b.status));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full mb-2">
            Service Provider Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {profile?.businessName || user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Status: <span className="text-emerald-400 font-bold uppercase">{profile?.verificationStatus || 'VERIFIED'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/incoming-requests"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            View Incoming Requests
          </Link>
        </div>
      </div>

      {/* Provider Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Jobs</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{activeJobs.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed Jobs</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{profile?.completedJobs || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Average Rating</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display flex items-center gap-1">
              {profile?.averageRating?.toFixed(1) || '4.8'}
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Base Job Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">₹{profile?.pricing?.baseRate || 400}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg font-display">Active Customer Jobs</h2>
          <Link to="/dashboard/active-jobs" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View all active jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No active jobs. Check incoming service requests to submit quotes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeJobs.map((b) => (
              <BookingCard key={b._id} booking={b} userRole="SERVICE_PROVIDER" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
