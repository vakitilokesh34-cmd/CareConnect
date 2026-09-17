import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) setBookings(res.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ACTIVE') return !['COMPLETED', 'CUSTOMER_CONFIRMED', 'CANCELLED'].includes(b.status);
    if (filter === 'COMPLETED') return ['COMPLETED', 'CUSTOMER_CONFIRMED'].includes(b.status);
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  const activeCount = bookings.filter((b) => !['COMPLETED', 'CUSTOMER_CONFIRMED', 'CANCELLED'].includes(b.status)).length;
  const completeCount = bookings.filter((b) => ['COMPLETED', 'CUSTOMER_CONFIRMED'].includes(b.status)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-2xl shadow-indigo-950/20 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,.22),_transparent_32%),radial-gradient(circle_at_left,_rgba(99,102,241,.34),_transparent_40%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200"><Sparkles className="h-3.5 w-3.5" /> Your home, in motion</span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your service journey, all in one place.</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">See what’s happening now, follow every update, and take the next step with confidence.</p>
          </div>
          <Link to="/dashboard/customer/requests/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-100"><Plus className="h-4 w-4" /> New service request</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><span className="flex items-center gap-2 text-xs font-semibold text-indigo-700"><Clock3 className="h-4 w-4" /> In progress</span><p className="mt-2 font-display text-3xl font-extrabold text-slate-950">{activeCount}</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><span className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Completed</span><p className="mt-2 font-display text-3xl font-extrabold text-slate-950">{completeCount}</p></div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4"><span className="flex items-center gap-2 text-xs font-semibold text-cyan-700"><CalendarDays className="h-4 w-4" /> All bookings</span><p className="mt-2 font-display text-3xl font-extrabold text-slate-950">{bookings.length}</p></div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-950">Bookings</h2>
          <p className="mt-1 text-xs text-slate-500">Choose a service to see its live status and next action.</p>
        </div>
        <div className="flex w-full items-center gap-1 overflow-x-auto cc-card rounded-2xl p-1.5 text-xs font-semibold sm:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === tab ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cc-card rounded-3xl border border-dashed p-12 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-indigo-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900">Nothing here just yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">When you accept a provider’s quote, your booking and its live progress will appear here.</p>
          <Link to="/dashboard/customer/requests/new" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700">Request a service</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filtered.map((b) => (
            <BookingCard key={b._id} booking={b} userRole="CUSTOMER" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
