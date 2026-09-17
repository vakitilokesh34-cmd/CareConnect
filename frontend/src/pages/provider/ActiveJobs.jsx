import React, { useEffect, useState } from 'react';
import { CheckSquare, Camera, ArrowRight, Clock, MapPin, Upload, X } from 'lucide-react';
import api from '../../services/api';
import BookingStatusTimeline from '../../components/BookingStatusTimeline';
import LoadingSpinner from '../../components/LoadingSpinner';

const ActiveJobs = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Status update form state
  const [nextStatus, setNextStatus] = useState('ACCEPTED');
  const [note, setNote] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings((res.data.data.bookings || []).filter((b) => b.status !== 'CANCELLED'));
      }
    } catch (err) {
      console.error('Failed to fetch provider active jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (b) => {
    setSelectedBooking(b);
    setNote('');
    setBeforeImage('');
    setAfterImage('');

    const flow = {
      CONFIRMED: 'ACCEPTED',
      ACCEPTED: 'ON_THE_WAY',
      ON_THE_WAY: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'COMPLETED',
      CUSTOMER_CONFIRMED: 'CUSTOMER_CONFIRMED',
    };
    setNextStatus(flow[b.status] || 'ACCEPTED');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Update status
      await api.put(`/bookings/${selectedBooking._id}/status`, { status: nextStatus });

      // 2. Log update & photos
      const beforeImages = beforeImage ? [beforeImage] : [];
      const afterImages = afterImage ? [afterImage] : [];

      await api.post(`/jobs/${selectedBooking._id}/updates`, {
        status: nextStatus,
        note: note || `Job status updated to ${nextStatus}`,
        beforeImages,
        afterImages,
      });

      alert(`Job updated to ${nextStatus.replace(/_/g, ' ')}!`);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading active jobs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Active Jobs & Service Evidence</h1>
        <p className="text-xs text-slate-500 mt-1">Update live job progress and upload before/after service photos.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="cc-card p-12 text-center rounded-2xl text-slate-400 text-xs">
          No active jobs assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((b) => (
            <div key={b._id} className="cc-card rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Customer: {b.customer?.name}</span>
                  <h3 className="font-bold text-slate-900 text-base">{b.serviceRequest?.title || 'Service Booking'}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                    {b.status?.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleOpenUpdateModal(b)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                  >
                    Update Progress & Photos
                  </button>
                </div>
              </div>

              <BookingStatusTimeline currentStatus={b.status} />

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {b.address?.line1 || 'Service Location'}
                </span>
                <span className="font-bold text-slate-900">Total Price: ₹{b.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cc-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Update Job Progress</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Next Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold text-indigo-700"
                >
                  <option value="ACCEPTED">ACCEPTED (Job Accepted)</option>
                  <option value="ON_THE_WAY">ON THE WAY (Heading to location)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Work underway)</option>
                  <option value="COMPLETED">COMPLETED (Job finished)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Note / Work Summary</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Arrived at location. Replaced leaking tap washer and tested flow."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Photo URLs / Evidence inputs */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" /> Upload Before/After Evidence
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Before Service Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={beforeImage}
                    onChange={(e) => setBeforeImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">After Service Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={afterImage}
                    onChange={(e) => setAfterImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Status & Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJobs;
