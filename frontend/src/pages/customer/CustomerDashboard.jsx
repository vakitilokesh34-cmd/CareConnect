import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ListOrdered, Calendar, Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, bookRes] = await Promise.all([
          api.get('/requests'),
          api.get('/bookings'),
        ]);
        if (reqRes.data.success) setRequests(reqRes.data.data.requests || []);
        if (bookRes.data.success) setBookings(bookRes.data.data.bookings || []);
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading customer dashboard..." />;

  const activeBookings = bookings.filter((b) => !['COMPLETED', 'CUSTOMER_CONFIRMED', 'CANCELLED'].includes(b.status));
  const openRequests = requests.filter((r) => r.status === 'OPEN' || r.status === 'QUOTES_RECEIVED');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-indigo-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Customer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Manage your service requests, compare AI-matched quotes, and track active bookings.
          </p>
        </div>

        <Link
          to="/dashboard/customer/requests/new"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 text-xs flex items-center justify-center gap-2 shrink-0 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Request
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="cc-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Open Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{openRequests.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ListOrdered className="w-6 h-6" />
          </div>
        </div>

        <div className="cc-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">{activeBookings.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="cc-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {bookings.filter((b) => b.status === 'CUSTOMER_CONFIRMED' || b.status === 'COMPLETED').length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg font-display">Active Service Bookings</h2>
          <Link to="/dashboard/customer/bookings" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="cc-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            No active bookings right now. Create a new service request to hire a provider.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeBookings.map((b) => (
              <BookingCard key={b._id} booking={b} userRole="CUSTOMER" />
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg font-display">Recent Service Requests</h2>
          <Link                     to={`/dashboard/customer/requests`} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View all requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="cc-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            No requests created yet.
          </div>
        ) : (
          <div className="cc-card rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {requests.slice(0, 5).map((req) => (
              <div key={req._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{req.title}</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                      {req.categoryName || 'General'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{req.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 uppercase">
                    {req.status?.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/dashboard/customer/requests`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                  >
                    View Quotes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
