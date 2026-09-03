import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, LogOut, LayoutDashboard, Sparkles, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleLabels = {
    CUSTOMER: 'Customer',
    SERVICE_PROVIDER: 'Service Provider',
    PLATFORM_ADMIN: 'Platform Admin',
    OPERATIONS_MANAGER: 'Ops Manager',
    SUPPORT_AGENT: 'Support Agent',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Care<span className="text-indigo-400">Connect</span>
              </span>
            </Link>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <Link to="/providers" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Find Providers
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationDropdown />

                {/* Dashboard button */}
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                      <p className="text-[10px] text-indigo-400 font-medium">
                        {roleLabels[user.role] || user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-850 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-fade-in text-slate-200 text-sm">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                          {roleLabels[user.role]}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        Profile Settings
                      </Link>

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-500/10 text-rose-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 text-sm font-medium">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            Services
          </Link>
          <Link
            to="/providers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            Find Providers
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 font-semibold"
            >
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
