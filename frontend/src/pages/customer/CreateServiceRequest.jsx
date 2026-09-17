import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, PlusCircle, Calendar, Clock, MapPin, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import ErrorMessage from '../../components/ErrorMessage';

const DEFAULT_CATEGORIES = [
  { _id: '6a97bec9594177f07169d9a3', name: 'Plumbing', icon: '🚰', basePrice: 350 },
  { _id: '6a97bec9594177f07169d9a5', name: 'Electrical', icon: '⚡', basePrice: 300 },
  { _id: '6a97bec9594177f07169d9a7', name: 'Home Cleaning', icon: '🧹', basePrice: 499 },
  { _id: '6a97bec9594177f07169d9a9', name: 'Appliance Repair', icon: '🔌', basePrice: 400 },
  { _id: '6a97bec9594177f07169d9ab', name: 'Carpentry', icon: '🪚', basePrice: 450 },
  { _id: '6a97bec9594177f07169d9ad', name: 'Painting', icon: '🎨', basePrice: 600 },
  { _id: '6a97bec9594177f07169d9af', name: 'AC Repair', icon: '❄️', basePrice: 500 },
  { _id: '6a97bec9594177f07169d9b1', name: 'Home Maintenance', icon: '🛠️', basePrice: 350 },
];

const CreateServiceRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerIdParam = searchParams.get('provider') || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 01:00 PM');
  const [addressLine, setAddressLine] = useState('12 Rose Apartments, Andheri West');
  const [city, setCity] = useState('Mumbai');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('');

  // AI Classification result state
  const [aiClassification, setAiClassification] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && Array.isArray(res.data.data.categories) && res.data.data.categories.length > 0) {
          setCategories(res.data.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleClassifyAI = async () => {
    if (!description || description.trim().length < 5) {
      setError('Please enter a problem description first for AI to analyze.');
      return;
    }
    setError('');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/classify-request', { description });
      if (res.data.success) {
        const classification = res.data.data.classification || res.data.data;
        setAiClassification(classification);
        if (!title && classification.category) {
          setTitle(`${classification.category} - ${classification.urgency || 'Standard'} Priority`);
        }
        if (classification.category) {
          const list = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
          const match = list.find(
            (c) => c.name.toLowerCase() === classification.category.toLowerCase()
          );
          if (match) setSelectedCategory(match._id);
        }
      }
    } catch (err) {
      console.error('AI classification failed:', err);
      setError('AI service error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description) {
      setError('Please provide a problem description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title || (aiClassification?.category ? `${aiClassification.category} Service Request` : 'Home Service Request'),
        description,
        category: selectedCategory || categories[0]?._id,
        address: {
          line1: addressLine,
          city,
          state: 'Maharashtra',
          postalCode: '400053',
        },
        preferredDate: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString(),
        preferredTime,
        AIClassification: aiClassification,
      };

      const res = await api.post('/requests', payload);
      if (res.data.success) {
        navigate('/dashboard/customer/requests');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI-Assisted Request Creation
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">Create Service Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          Describe what you need fixed in free-text. AI automatically detects category, required skills, and urgency.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="cc-card rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Request Title (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Kitchen tap leaking, AC not cooling..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Free Text Description & AI Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleClassifyAI}
              disabled={aiLoading}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              {aiLoading ? 'Analyzing...' : 'Classify with AI'}
            </button>
          </div>
          <textarea
            required
            rows={4}
            placeholder="Describe your issue (e.g. My kitchen tap is leaking continuously and water is coming under the sink. Need an expert plumber urgently.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-xs rounded-2xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>

        {/* AI Output Card */}
        {aiClassification && (
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Smart Classification
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Confidence: {Math.round((aiClassification.confidence || 0.9) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                <span className="font-bold text-white text-sm">{aiClassification.category}</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Urgency</span>
                <span className={`font-bold text-sm ${aiClassification.urgency === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {aiClassification.urgency || 'Medium'}
                </span>
              </div>
            </div>

            {aiClassification.requiredSkills && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Required Skills Extracted</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiClassification.requiredSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category manual selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800">
              Service Category <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Select category or click 'Classify with AI' above
            </span>
          </div>

          {/* Interactive Visual Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            {categories.map((c) => {
              const isSelected = selectedCategory === c._id;
              return (
                <button
                  type="button"
                  key={c._id}
                  onClick={() => setSelectedCategory(c._id)}
                  className={`p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-600 shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/20 -translate-y-0.5'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{c.icon || '🛠️'}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`block font-bold text-xs ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      From ₹{c.basePrice || 350}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-medium text-slate-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="" className="text-slate-500">-- Or select from dropdown --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="text-slate-900">
                {c.icon || '🛠️'} {c.name} (Base ₹{c.basePrice})
              </option>
            ))}
          </select>
        </div>

        {/* Schedule & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Preferred Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Preferred Time Slot</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="08:00 AM - 11:00 AM">08:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 02:00 PM">11:00 AM - 02:00 PM</option>
              <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
              <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">Service Location</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Address Line"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="sm:col-span-2 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          {submitting ? 'Submitting Request...' : 'Submit Request & Find Providers'}
        </button>
      </form>
    </div>
  );
};

export default CreateServiceRequest;
