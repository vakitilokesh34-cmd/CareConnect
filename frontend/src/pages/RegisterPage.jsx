import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Phone, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        ...(role === 'SERVICE_PROVIDER' ? { businessName } : {}),
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      // Show individual field validation errors if available
      if (data?.errors && Array.isArray(data.errors)) {
        setError(data.errors.map((e) => e.msg || e.message).join(' · '));
      } else {
        setError(data?.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="max-w-md w-full bg-slate-850 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold font-display">Create Account</h2>
          <p className="text-xs text-slate-400">Join CareConnect as a customer or service professional</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 rounded-xl transition-all ${
              role === 'CUSTOMER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('SERVICE_PROVIDER')}
            className={`py-2 rounded-xl transition-all ${
              role === 'SERVICE_PROVIDER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Provider
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {role === 'SERVICE_PROVIDER' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Business Name</label>
              <div className="relative">
                <Wrench className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Apex Plumbing Services"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, number & symbol"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Must include uppercase, lowercase, number &amp; special character (e.g. <span className="text-slate-400">Pass@123</span>)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Registering...' : `Register as ${role === 'CUSTOMER' ? 'Customer' : 'Provider'}`}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
