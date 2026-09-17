import React from 'react';
import { Calendar, Clock, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingCard = ({ booking, userRole }) => {
  const detailPath =
    userRole === 'SERVICE_PROVIDER'
      ? null
      : userRole === 'OPERATIONS_MANAGER'
      ? '/dashboard/ops/bookings'
      : userRole === 'PLATFORM_ADMIN'
      ? '/dashboard/admin'
      : `/dashboard/customer/bookings/${booking._id}`;
  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    ACCEPTED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ON_THE_WAY: 'bg-purple-100 text-purple-800 border-purple-200',
    IN_PROGRESS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CUSTOMER_CONFIRMED: 'bg-emerald-600 text-white border-emerald-600',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    DISPUTED: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <article className="cc-card group relative overflow-hidden rounded-3xl p-5">
      <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-200/50 blur-2xl transition group-hover:bg-cyan-200/60" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Booking ID</span>
          <p className="text-xs font-mono font-bold text-slate-700">#{booking._id?.slice(-8)}</p>
        </div>

        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
            statusColors[booking.status] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {booking.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="relative py-5 space-y-4">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600"><Sparkles className="h-3.5 w-3.5" /> Service journey</span>
        <h4 className="font-bold text-slate-900 text-base">
          {booking.serviceRequest?.title || 'Home Service Booking'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {booking.scheduledStartTime
                ? new Date(booking.scheduledStartTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                : 'Flexible date'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {booking.scheduledStartTime
                ? new Date(booking.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Time slot'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              {booking.address?.line1 ? `${booking.address.line1}, ${booking.address.city}` : 'Customer Location'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Amount</span>
          <span className="text-lg font-bold text-slate-900 font-display">₹{booking.totalPrice}</span>
        </div>

        {detailPath ? (
          <Link
            to={detailPath}
            className="px-4 py-2.5 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            Manage Booking
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="px-4 py-2.5 bg-slate-900/50 text-slate-300 rounded-2xl text-xs font-semibold border border-slate-200 text-center">
            View job on your dashboard
          </span>
        )}
      </div>
    </article>
  );
};

export default BookingCard;
