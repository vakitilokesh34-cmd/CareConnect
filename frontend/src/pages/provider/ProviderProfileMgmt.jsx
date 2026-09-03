import React, { useEffect, useState } from 'react';
import { UserCheck, ShieldCheck, Save, Plus, Wrench, DollarSign } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProviderProfileMgmt = () => {
  const [profile, setProfile] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState(3);
  const [baseRate, setBaseRate] = useState(400);
  const [skillsStr, setSkillsStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/providers/profile');
      if (res.data.success) {
        const p = res.data.data.provider || res.data.data;
        setProfile(p);
        setBusinessName(p.businessName || '');
        setDescription(p.description || '');
        setExperience(p.experience || 3);
        setBaseRate(p.pricing?.baseRate || 400);
        setSkillsStr((p.skills || []).join(', '));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        businessName,
        description,
        experience,
        skills,
        pricing: { baseRate, unit: 'PER_JOB' },
      };

      const res = await api.put('/providers/profile', payload);
      if (res.data.success) {
        alert('Profile saved successfully!');
        setProfile(res.data.data.provider || res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile settings..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">Business Profile & Verification</h1>
          <p className="text-xs text-slate-500 mt-1">Manage pricing rates, skills, and verification status.</p>
        </div>

        <span
          className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
            profile?.verificationStatus === 'VERIFIED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {profile?.verificationStatus || 'VERIFIED'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">Business Name</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Business Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Experience (Years)</label>
            <input
              type="number"
              min={0}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Base Pricing Rate (₹ / Job)</label>
            <input
              type="number"
              min={100}
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-700"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Skills (Comma separated)</label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            placeholder="Leak Repair, Pipe Repair, AC Service..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Profile Details
        </button>
      </form>
    </div>
  );
};

export default ProviderProfileMgmt;
