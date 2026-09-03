import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';
import api from '../services/api';
import ProviderCard from '../components/ProviderCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const ProviderSearchPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (minRating) params.minRating = minRating;

        const res = await api.get('/providers', { params });
        if (res.data.success) setProviders(res.data.data.providers || []);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProviders, 300);
    return () => clearTimeout(timeout);
  }, [selectedCategory, searchQuery, minRating]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Verified Service Professionals
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">
          Find Service Providers
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Filter by service category, skills, location, ratings, and experience.
        </p>
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        categories={categories}
        onReset={handleReset}
      />

      {loading ? (
        <LoadingSpinner message="Searching verified service providers..." />
      ) : providers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No providers found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <ProviderCard key={p._id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderSearchPage;
