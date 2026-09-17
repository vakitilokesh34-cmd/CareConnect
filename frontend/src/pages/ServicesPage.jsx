import React, { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import api from '../services/api';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="cc-card p-8 rounded-3xl space-y-4 shadow-xl border border-indigo-300/40 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-400/25 rounded-full blur-3xl cc-spin-slow" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-300/40 text-indigo-700 text-xs font-semibold relative">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Home Service Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display cc-gradient-text relative">
          Explore All Home Services
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl relative">
          Browse verified categories from plumbing to electrical work and appliance repair. Select a category to find expert service providers.
        </p>

        {/* Search */}
        <div className="pt-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search category (e.g. Plumbing, AC, Cleaning)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 text-slate-900 rounded-xl text-xs cc-input placeholder-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading service categories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <ServiceCategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
