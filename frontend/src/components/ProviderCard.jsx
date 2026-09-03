import React from 'react';
import { Star, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProviderCard = ({ provider, onSelect }) => {
  const isVerified = provider.verificationStatus === 'VERIFIED';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
              {provider.user?.name ? provider.user.name.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-base">{provider.businessName || provider.user?.name}</h4>
                {isVerified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Professional" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">By {provider.user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{provider.averageRating ? provider.averageRating.toFixed(1) : '4.8'}</span>
            <span className="text-[10px] text-amber-600 font-normal">({provider.totalReviews || 12})</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
          {provider.description || 'Experienced professional offering high quality service.'}
        </p>

        {/* Skills & Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(provider.skills || []).slice(0, 4).map((skill, idx) => (
              <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              {provider.completedJobs || 0} jobs done
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {provider.serviceAreas?.[0]?.city || 'Pan India'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Starting from</span>
          <span className="text-base font-bold text-slate-900">
            ₹{provider.pricing?.baseRate || 400}
            <span className="text-xs font-normal text-slate-500"> / job</span>
          </span>
        </div>

        {onSelect ? (
          <button
            onClick={() => onSelect(provider)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1"
          >
            Select Provider
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/providers/${provider._id}`}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProviderCard;
