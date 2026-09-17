import React, { useEffect, useState } from 'react';
import { ListOrdered, Sparkles, Send, Clock, MapPin, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  // Quote form state
  const [estimatedPrice, setEstimatedPrice] = useState(450);
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('2-3 hours');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        // filter open or quotes_received requests
        setRequests((res.data.data.requests || []).filter((r) => r.status === 'OPEN' || r.status === 'QUOTES_RECEIVED'));
      }
    } catch (err) {
      console.error('Failed to fetch open requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (req) => {
    setSelectedReq(req);
    setDescription(`I will complete the ${req.categoryName || 'service'} work within professional standards.`);
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        serviceRequest: selectedReq._id,
        estimatedPrice,
        description,
        estimatedDuration,
      };

      const res = await api.post('/quotes', payload);
      if (res.data.success) {
        alert('Quote submitted successfully to customer!');
        setSelectedReq(null);
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading incoming service requests..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Incoming Service Requests</h1>
        <p className="text-xs text-slate-500 mt-1">Review open customer requests and submit estimated quotes.</p>
      </div>

      {requests.length === 0 ? (
        <div className="cc-card p-12 text-center rounded-2xl text-slate-400 text-xs">
          No open service requests right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div key={req._id} className="cc-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                  {req.categoryName || 'General Service'}
                </span>
                <span className="text-xs text-slate-400">
                  Date: {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : 'Asap'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{req.description}</p>
              </div>

              {/* AI Details */}
              {req.AIClassification && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span className="font-semibold text-slate-700">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {(req.AIClassification.requiredSkills || []).map((sk, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-white text-indigo-700 px-2 py-0.5 rounded border border-slate-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Location: {req.address?.line1 || 'Customer Address'} ({req.address?.city || 'Mumbai'})
                </span>

                <button
                  onClick={() => handleOpenQuoteModal(req)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Form Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cc-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Submit Quote</h3>
              <button onClick={() => setSelectedReq(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Price (₹)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quote Description / Work Plan</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedReq(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;
