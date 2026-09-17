import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, CheckCircle2, Award, Calendar, ArrowRight } from 'lucide-react';
import api from '../services/api';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProviderDetailsPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [provRes, revRes] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/reviews/provider/${id}`),
        ]);
        if (provRes.data.success) {
          setProvider(provRes.data.data.provider || provRes.data.data);
          // Backend /providers/:id returns reviews embedded - use if available
          if (provRes.data.data.reviews) setReviews(provRes.data.data.reviews);
        }
        if (revRes.data.success) setReviews(revRes.data.data.reviews || []);
      } catch (err) {
        console.error('Failed to load provider details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading provider details..." />;
  if (!provider) return <div className="p-8 text-center text-slate-200">Provider not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="cc-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-3xl shadow-lg shrink-0">
            {provider.businessName?.charAt(0) || provider.user?.name?.charAt(0) || 'P'}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">{provider.businessName}</h1>
              {provider.verificationStatus === 'VERIFIED' && (
                <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified Provider" />
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">Owned & Operated by {provider.user?.name}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {provider.averageRating?.toFixed(1) || '4.8'} rating ({provider.totalReviews || 0} reviews)
              </span>

              <span className="flex items-center gap-1 font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                {provider.completedJobs || 0} Jobs Done
              </span>

              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Award className="w-4 h-4 text-cyan-500" />
                {provider.experience || 3}+ Years Exp.
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Price Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display">₹{provider.pricing?.baseRate || 400}</span>
            <span className="text-xs text-slate-500"> / job</span>
          </div>

          <Link
            to={`/dashboard/customer/requests/new?provider=${provider._id}`}
            className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            Request Quote from Provider
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Description & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="cc-card rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-base">About {provider.businessName}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {provider.description || 'Experienced professional with high standards of customer service and quality craftsmanship.'}
            </p>
          </div>

          {/* Reviews section */}
          <div className="cc-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Customer Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <ReviewCard key={rev._id} review={rev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="cc-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {(provider.skills || []).map((skill, idx) => (
                <span key={idx} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="cc-card rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Service Areas</h3>
            <div className="space-y-2 text-xs text-slate-600">
              {(provider.serviceAreas || []).map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{area.city} ({area.pincode})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;
