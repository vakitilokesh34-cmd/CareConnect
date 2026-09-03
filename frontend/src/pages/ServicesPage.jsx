import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Wrench } from 'lucide-react';
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
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-xl border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Home Service Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display">
          Explore All Home Services
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl">
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
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
