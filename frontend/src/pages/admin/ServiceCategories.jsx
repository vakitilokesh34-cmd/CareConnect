import React, { useEffect, useState } from 'react';
import { Tag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🛠️');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(400);
  const [skillsStr, setSkillsStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requiredSkills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/categories', {
        name,
        icon,
        description,
        basePrice,
        requiredSkills,
      });

      if (res.data.success) {
        setCategories((prev) => [...prev, res.data.data.category]);
        setName('');
        setDescription('');
        setSkillsStr('');
        alert('New category created!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Service Category Management</h1>
        <p className="text-xs text-slate-500 mt-1">Add and configure marketplace service categories and base pricing rules.</p>
      </div>

      {/* Add new category form */}
      <form onSubmit={handleCreateCategory} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-indigo-600" /> Add New Service Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Waterproofing"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Emoji Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Price (₹)</label>
            <input
              type="number"
              min={100}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Professional waterproofing for roof and walls..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            placeholder="Roof Grouting, Chemical Coating..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
        >
          Save Category
        </button>
      </form>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon || '🛠️'}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                <p className="text-slate-500 line-clamp-1">{cat.description}</p>
              </div>
            </div>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
              ₹{cat.basePrice}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories;
