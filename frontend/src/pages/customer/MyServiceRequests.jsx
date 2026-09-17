import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListOrdered, Sparkles, Clock, CheckCircle2, ChevronRight, MessageSquare, X } from 'lucide-react';
import api from '../../services/api';
import QuoteCard from '../../components/QuoteCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyServiceRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [bookingAction, setBookingAction] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) setRequests(res.data.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuotes = async (req) => {
    setSelectedReq(req);
    setQuotesLoading(true);
    try {
      const res = await api.get(`/quotes/request/${req._id}`);
      if (res.data.success) setQuotes(res.data.data.quotes || []);
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleAcceptQuote = async (quote) => {
    setBookingAction(true);
    try {
      // Creating the booking accepts the quote atomically on the server.
      // Accepting it here first makes the booking endpoint reject the quote.
      const bookingPayload = {
        customer: selectedReq.customer,
        provider: quote.provider._id || quote.provider,
        serviceRequest: selectedReq._id,
        quote: quote._id,
        scheduledStartTime: selectedReq.preferredDate || new Date(Date.now() + 86400000).toISOString(),
        scheduledEndTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
        address: selectedReq.address,
        totalPrice: quote.estimatedPrice,
      };

      const res = await api.post('/bookings', bookingPayload);
      if (res.data.success) {
        const booking = res.data.data.booking;
        setSelectedReq(null);
        fetchRequests();
        navigate(`/dashboard/customer/bookings/${booking._id}`);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      alert(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setBookingAction(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your service requests..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">My Service Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Review quotes submitted by providers for your requests.</p>
        </div>

        <Link
          to="/dashboard/customer/requests/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          + New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="cc-card p-12 text-center rounded-2xl text-slate-400 text-xs">
          No service requests created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div key={req._id} className="cc-card rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    {req.categoryName || req.category?.name || 'General'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Created {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 uppercase tracking-wider">
                  {req.status?.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{req.description}</p>
              </div>

              {/* AI tags */}
              {req.AIClassification && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700">AI Urgency:</span>
                  <span className="font-bold text-indigo-700">{req.AIClassification.urgency || 'Medium'}</span>
                  {req.AIClassification.requiredSkills && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {req.AIClassification.requiredSkills.map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Location: {req.address?.city || 'Mumbai'}
                </span>

                <button
                  onClick={() => handleOpenQuotes(req)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {req.status === 'BOOKED' ? 'View booking' : 'View submitted quotes'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quotes Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cc-card rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Compare Quotes</h3>
                <p className="text-xs text-slate-500">{selectedReq.title}</p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quotesLoading ? (
              <LoadingSpinner message="Fetching quotes..." />
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No quotes received yet for this request. Matching providers have been notified.
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => (
                  <QuoteCard key={q._id} quote={q} onSelectQuote={handleAcceptQuote} disabled={bookingAction} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyServiceRequests;
