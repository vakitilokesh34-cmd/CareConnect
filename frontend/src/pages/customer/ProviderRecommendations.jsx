import React, { useEffect, useState } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';
import ProviderRecommendationCard from '../../components/ProviderRecommendationCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProviderRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/recommend-providers', {
          categoryName: selectedCategory || undefined,
          requiredSkills: ['Leak Repair', 'Pipe Repair'],
          city: 'Mumbai',
        });
        if (res.data.success) {
          setRecommendations(res.data.data.recommendations);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl border border-indigo-500/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Provider Recommendation Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
          AI Provider Recommendations
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
          Providers are ranked dynamically by analyzing Skill Match (30%), Availability (20%), Rating (20%), Experience (15%), Service Area (10%), and Completed Jobs (5%).
        </p>

        {/* Category filter */}
        <div className="pt-2 max-w-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Categories (Plumbing, Electrical, etc.)</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating AI Match Scores for providers..." />
      ) : recommendations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No matching providers found for selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => (
            <ProviderRecommendationCard key={rec.provider?._id || idx} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderRecommendations;
