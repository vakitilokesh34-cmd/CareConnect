import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState(user?.addresses || [
    { label: 'Home', line1: '12 Rose Apartments, Andheri West', city: 'Mumbai', state: 'Maharashtra', postalCode: '400053' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { name, phone, addresses });
      if (res.data.success) {
        updateUser(res.data.data.user || res.data.data);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Profile & Address Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account credentials and default service addresses.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Email (Read Only)</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Addresses */}
        <div className="space-y-3 pt-2">
          <label className="block font-bold text-slate-800">Service Addresses</label>
          {addresses.map((addr, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <input
                type="text"
                placeholder="Street Address Line"
                value={addr.line1}
                onChange={(e) => {
                  const copy = [...addresses];
                  copy[idx].line1 = e.target.value;
                  setAddresses(copy);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={addr.city}
                  onChange={(e) => {
                    const copy = [...addresses];
                    copy[idx].city = e.target.value;
                    setAddresses(copy);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={addr.postalCode}
                  onChange={(e) => {
                    const copy = [...addresses];
                    copy[idx].postalCode = e.target.value;
                    setAddresses(copy);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
