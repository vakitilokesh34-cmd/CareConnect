import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, MapPin, FileText, AlertTriangle, Star,
  ShieldCheck, ArrowLeft, Image as ImageIcon, MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import BookingStatusTimeline from '../../components/BookingStatusTimeline';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [jobUpdates, setJobUpdates] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Workmanship quality');
  const [disputeDesc, setDisputeDesc] = useState('');

  useEffect(() => {
    fetchBookingData();
  }, [id]);

  const fetchBookingData = async () => {
    try {
      const [bRes, jRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/jobs/${id}/updates`),
      ]);
      if (bRes.data.success) setBooking(bRes.data.data.booking);
      if (jRes.data.success) setJobUpdates(jRes.data.data.updates || []);

      try {
        const invRes = await api.get(`/invoices/booking/${id}`);
        if (invRes.data.success) setInvoice(invRes.data.data.invoice);
      } catch (e) {
        // invoice may not exist yet if job not completed
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
      setError('Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/bookings/${id}/confirm-completion`);
      if (res.data.success) {
        setBooking(res.data.data.booking);
        setShowReviewModal(true); // Prompt review right after confirming!
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm completion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/reviews', {
        booking: booking._id,
        provider: booking.provider._id || booking.provider,
        rating,
        comment,
      });
      alert('Review submitted! Thank you.');
      setShowReviewModal(false);
      fetchBookingData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/disputes', {
        booking: booking._id,
        reason: disputeReason,
        description: disputeDesc,
      });
      alert('Dispute submitted. Support agent will review your issue.');
      setShowDisputeModal(false);
      fetchBookingData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise dispute.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading booking details..." />;
  if (!booking) return <div className="p-8 text-center text-slate-500">Booking not found</div>;

  const provider = booking.provider?.user || booking.provider || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top back & title bar */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard/customer/bookings" className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>
        <span className="text-xs font-mono font-bold text-slate-400">Booking #{booking._id?.slice(-8)}</span>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Details Card */}
      <div className="cc-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-display">
              {booking.serviceRequest?.title || 'Home Service Booking'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled on {booking.scheduledStartTime ? new Date(booking.scheduledStartTime).toLocaleString() : 'Requested Time'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {booking.status === 'COMPLETED' && (
              <button
                onClick={handleConfirmCompletion}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Job Completion
              </button>
            )}

            {booking.status === 'CUSTOMER_CONFIRMED' && !showReviewModal && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Star className="w-4 h-4" />
                Write Review
              </button>
            )}

            {!['CANCELLED', 'DISPUTED', 'CUSTOMER_CONFIRMED'].includes(booking.status) && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
              >
                Raise Dispute
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <BookingStatusTimeline currentStatus={booking.status} />

        {/* Provider info & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Assigned Service Provider</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                {provider.businessName?.charAt(0) || provider.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{provider.businessName || provider.name}</h4>
                <p className="text-slate-500 font-medium">{provider.email || provider.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-slate-200 sm:pl-6">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
              <span className="text-xl font-extrabold text-slate-900 font-display">₹{booking.totalPrice}</span>
            </div>

            {invoice && (
              <Link
                to={`/dashboard/customer/bookings/${booking._id}/invoice`}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> View Invoice
              </Link>
            )}
          </div>
        </div>

        {/* Job Updates & Evidence Photos */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Service Progress & Evidence Photos</h3>
          {jobUpdates.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No job progress notes or evidence uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {jobUpdates.map((update, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">
                      Status: {update.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(update.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {update.note && <p className="text-slate-700">{update.note}</p>}

                  {/* Before / After Images */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {update.beforeImages?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Before Service:</span>
                        <div className="flex gap-2">
                          {update.beforeImages.map((img, i) => (
                            <img key={i} src={img} alt="Before" className="w-16 h-16 object-cover rounded-lg border" />
                          ))}
                        </div>
                      </div>
                    )}
                    {update.afterImages?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">After Service:</span>
                        <div className="flex gap-2">
                          {update.afterImages.map((img, i) => (
                            <img key={i} src={img} alt="After" className="w-16 h-16 object-cover rounded-lg border border-emerald-300" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cc-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Leave a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition-all ${
                        star <= rating ? 'text-amber-400 bg-amber-50' : 'text-slate-300 bg-slate-100'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comment / Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this service professional..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cc-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Raise Dispute / Complaint</h3>
            <form onSubmit={handleRaiseDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Workmanship quality">Workmanship quality</option>
                  <option value="Pricing conflict">Pricing conflict</option>
                  <option value="Provider delayed / no-show">Provider delayed / no-show</option>
                  <option value="Damage during service">Damage during service</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Describe what went wrong in detail..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
