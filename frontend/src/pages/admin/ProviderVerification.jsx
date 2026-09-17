import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProviderVerification = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get('/admin/providers');
      if (res.data.success) setProviders(res.data.data.providers || []);
    } catch (err) {
      console.error('Failed to fetch admin providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/providers/${id}/verify`, { verificationStatus: status });
      setProviders((prev) => prev.map((p) => (p._id === id ? { ...p, verificationStatus: status } : p)));
    } catch (err) {
      alert('Verification update failed.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading provider verifications..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Provider Verification Management</h1>
        <p className="text-xs text-slate-500 mt-1">Audit verification credentials and approve contractor licenses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {providers.map((p) => (
          <div key={p._id} className="cc-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base">{p.businessName || p.user?.name}</h4>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${p.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {p.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">Contractor: {p.user?.name} ({p.user?.email})</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(p.skills || []).map((sk, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerify(p._id, 'VERIFIED')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
              </button>
              <button
                onClick={() => handleVerify(p._id, 'REJECTED')}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderVerification;
