import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import CareConnectLogo from '../components/CareConnectLogo';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md cc-card rounded-3xl p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 space-y-6 cc-rise relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl cc-spin-slow" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl cc-spin-slow" />

        <div className="text-center space-y-2 relative">
          <div className="flex items-center justify-center mb-1">
            <CareConnectLogo size={56} />
          </div>
          <h2 className="text-2xl font-extrabold font-display cc-gradient-text">Welcome Back</h2>
          <p className="text-xs text-slate-600">Sign in to access your CareConnect account</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white/90 text-slate-900 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500 transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white/90 text-slate-900 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500 transition-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 cc-btn-glow text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative text-center text-xs text-slate-600 pt-2">
          <span className="inline-flex items-center gap-1 text-indigo-600 font-medium mb-3">
            <Sparkles className="w-3 h-3 text-cyan-500" /> Secure AI-powered access
          </span>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;