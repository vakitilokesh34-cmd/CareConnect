import React from 'react';
import { Clock, ShieldCheck, Star, CheckCircle, Tag } from 'lucide-react';

const QuoteCard = ({ quote, onSelectQuote, isSelected = false, disabled = false }) => {
  const provider = quote.provider || {};
  const statusBadges = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-slate-100 text-slate-600 border-slate-200',
    EXPIRED: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all ${
        isSelected
          ? 'border-2 border-indigo-600 ring-4 ring-indigo-50 shadow-xl'
          : 'border-slate-200 shadow-sm hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
            {provider.businessName?.charAt(0) || provider.user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-base">{provider.businessName || provider.user?.name || 'Service Provider'}</h4>
              {provider.verificationStatus === 'VERIFIED' && (
                <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {provider.averageRating?.toFixed(1) || '4.8'}
              </span>
              <span>•</span>
              <span>{provider.completedJobs || 10} jobs completed</span>
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${
            statusBadges[quote.status] || statusBadges.PENDING
          }`}
        >
          {quote.status}
        </span>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
        "{quote.description}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Estimated Price</span>
            <span className="text-xl font-extrabold text-slate-900 font-display">₹{quote.estimatedPrice}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Duration</span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {quote.estimatedDuration || '2-3 hours'}
            </span>
          </div>
        </div>

        {onSelectQuote && quote.status === 'PENDING' && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuote(quote)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Accept & Book Quote
          </button>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;
