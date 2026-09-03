import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const OpsAssign = () => {
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/requests'),
        api.get('/providers'),
      ]);
      if (rRes.data.success) setRequests((rRes.data.data.requests || []).filter((r) => r.status === 'OPEN'));
      if (pRes.data.success) setProviders(pRes.data.data.providers || []);
    } catch (err) {
      console.error('Failed to load ops assign data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (requestId, providerId) => {
    try {
      // Create direct quote and booking
      const quoteRes = await api.post('/quotes', {
        serviceRequest: requestId,
        provider: providerId,
        estimatedPrice: 500,
        description: 'Assigned manually by Operations Manager',
        estimatedDuration: '2 hours',
      });

      if (quoteRes.data.success) {
        await api.post('/bookings', {
          serviceRequest: requestId,
          provider: providerId,
          quote: quoteRes.data.data._id,
          scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
          scheduledEndTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
          totalPrice: 500,
        });

        alert('Provider assigned manually and booking created!');
        fetchData();
      }
    } catch (err) {
      alert('Failed to assign provider manually.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading open requests for assignment..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Manual Provider Assignment</h1>
        <p className="text-xs text-slate-500 mt-1">Assign verified service contractors manually to open customer requests.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No unassigned open requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                <span className="px-2.5 py-0.5 font-bold rounded bg-indigo-50 text-indigo-700">
                  {req.categoryName}
                </span>
              </div>
              <p className="text-slate-600">{req.description}</p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400">Location: {req.address?.city}</span>

                <div className="flex items-center gap-2">
                  <select
                    id={`assign-${req._id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  >
                    <option value="">Select Contractor</option>
                    {providers.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.businessName || p.user?.name} (₹{p.pricing?.baseRate})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const selectEl = document.getElementById(`assign-${req._id}`);
                      if (selectEl.value) handleManualAssign(req._id, selectEl.value);
                      else alert('Select a provider first.');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow"
                  >
                    Assign Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpsAssign;
