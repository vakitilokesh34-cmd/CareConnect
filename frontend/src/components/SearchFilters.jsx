import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  minRating,
  onMinRatingChange,
  categories = [],
  onReset,
}) => {
  return (
    <div className="cc-card rounded-2xl p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keyword, skill or city..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="">All Service Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c._id || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating filter & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={minRating}
            onChange={(e) => onMinRatingChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5★ & above</option>
            <option value="4.0">4.0★ & above</option>
            <option value="3.5">3.5★ & above</option>
          </select>

          {onReset && (
            <button
              onClick={onReset}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-slate-200 shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
