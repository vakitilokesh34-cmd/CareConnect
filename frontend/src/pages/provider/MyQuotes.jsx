import React, { useEffect, useState } from 'react';
import { FileText, Clock, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/quotes/my');
      if (res.data.success) setQuotes(res.data.data.quotes || []);
    } catch (err) {
      console.error('Failed to fetch provider quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your quotes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Provider workspace</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 font-display">My submitted quotes</h1>
          <p className="text-xs text-slate-500 mt-1">Track responses and keep your next offer one tap away.</p>
        </div>
        <Link to="/dashboard/provider/requests" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"><Plus className="h-4 w-4" /> Create a quote</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 text-slate-400 text-xs">
          <FileText className="mx-auto h-8 w-8 text-indigo-300" />
          <p className="mt-3">No quotes submitted yet.</p>
          <Link to="/dashboard/provider/requests" className="mt-4 inline-flex items-center gap-2 font-bold text-indigo-600"><Send className="h-3.5 w-3.5" /> Browse requests</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quotes.map((q) => (
            <div key={q._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-xs">
                  {q.serviceRequest?.title || 'Service Request Quote'}
                </span>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                    q.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : q.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {q.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">"{q.description}"</p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="font-bold text-slate-900">Price: ₹{q.estimatedPrice}</span>
                <span className="text-slate-500">Duration: {q.estimatedDuration || '2 hours'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuotes;
