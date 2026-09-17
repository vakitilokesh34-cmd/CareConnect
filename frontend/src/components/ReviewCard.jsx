import React from 'react';
import { Star, User } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="cc-card rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
            {review.customer?.name ? review.customer.name.charAt(0) : 'C'}
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-xs">{review.customer?.name || 'Verified Customer'}</h5>
            <span className="text-[10px] text-slate-400">
              {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-amber-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{review.rating}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-medium">
        "{review.comment}"
      </p>
    </div>
  );
};

export default ReviewCard;
