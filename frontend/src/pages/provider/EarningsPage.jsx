import React, { useEffect, useState } from 'react';
import { DollarSign, Star, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import ReviewCard from '../../components/ReviewCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const EarningsPage = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/providers/profile');
      if (pRes.data.success) {
        const providerData = pRes.data.data.provider || pRes.data.data;
        setProfile(providerData);
        const rRes = await api.get(`/reviews/provider/${providerData._id}`);
        if (rRes.data.success) setReviews(rRes.data.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load earnings data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading earnings & performance..." />;

  const estimatedEarnings = (profile?.completedJobs || 0) * (profile?.pricing?.baseRate || 400);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Earnings & Performance Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">Review revenue analytics and customer ratings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Estimated Total Revenue</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display flex items-center gap-1">
            ₹{estimatedEarnings.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Calculated from {profile?.completedJobs || 0} jobs
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Average Rating</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display flex items-center gap-1">
            {profile?.averageRating?.toFixed(1) || '4.8'}
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Based on {profile?.totalReviews || 0} customer reviews</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Completed Jobs</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {profile?.completedJobs || 0}
          </div>
          <span className="text-[10px] text-indigo-600 font-bold">Verified Platform Contractor</span>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 text-lg font-display">Customer Feedback & Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No reviews submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;
