import React, { useState } from 'react';
import { Sparkles, Star, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProviderRecommendationCard = ({ recommendation, onSelectQuoteRequest }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const provider = recommendation.provider || recommendation;
  const matchScore = recommendation.score || 85;
  const breakdown = recommendation.breakdown || {
    skillMatch: 30,
    availability: 20,
    rating: 18,
    experience: 14,
    serviceArea: 10,
    completedJobs: 5,
  };
  const explanation = recommendation.explanation ||
    "Recommended because this provider matches all required skills, operates in your area, and maintains a high customer rating.";

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
      {/* AI recommendation badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-cyan-600 text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl shadow flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-cyan-300" />
        AI Recommended
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white font-bold flex items-center justify-center text-xl shadow-lg shrink-0">
            {provider.businessName?.charAt(0) || provider.user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-lg">{provider.businessName || provider.user?.name}</h4>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Verified" />
            </div>
            <p className="text-xs text-slate-500 font-medium">By {provider.user?.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {provider.averageRating?.toFixed(1) || '4.8'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">{provider.completedJobs || 15} jobs</span>
            </div>
          </div>
        </div>

        {/* AI Match Score Radial / Meter */}
        <div className="flex flex-col items-center sm:items-end shrink-0 bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-700 font-display">{matchScore}%</span>
            <span className="text-xs font-bold text-indigo-500">Match</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">AI Confidence Score</p>
        </div>
      </div>

      {/* AI Explanation Box */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs text-slate-700 mb-4 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">{explanation}</p>
      </div>

      {/* Breakdown toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showBreakdown ? 'Hide Match Breakdown' : 'View Match Breakdown'}
        </button>

        {showBreakdown && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 animate-fade-in">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Skill Match</span>
                <span className="text-indigo-600">{breakdown.skillMatch || 30}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(breakdown.skillMatch / 30) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Availability</span>
                <span className="text-indigo-600">{breakdown.availability || 20}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${(breakdown.availability / 20) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Rating</span>
                <span className="text-indigo-600">{breakdown.rating || 20}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(breakdown.rating / 20) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Experience</span>
                <span className="text-indigo-600">{breakdown.experience || 15}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(breakdown.experience / 15) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Service Area</span>
                <span className="text-indigo-600">{breakdown.serviceArea || 10}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(breakdown.serviceArea / 10) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Completed Jobs</span>
                <span className="text-indigo-600">{breakdown.completedJobs || 5}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(breakdown.completedJobs / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium">
          Rate: <strong className="text-slate-900 font-bold">₹{provider.pricing?.baseRate || 400}</strong> / job
        </span>

        {onSelectQuoteRequest ? (
          <button
            onClick={() => onSelectQuoteRequest(provider)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            Request Quote
          </button>
        ) : (
          <Link
            to={`/providers/${provider._id}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProviderRecommendationCard;
