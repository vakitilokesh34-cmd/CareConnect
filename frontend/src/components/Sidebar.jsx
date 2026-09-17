import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ListOrdered, Calendar, FileText,
  UserCheck, ShieldCheck, Tag, AlertOctagon, BarChart3,
  CheckSquare, DollarSign, Users, Activity, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleNavItems = {
    CUSTOMER: [
      { path: '/dashboard/customer', label: 'Overview', icon: LayoutDashboard, end: true },
      { path: '/dashboard/customer/requests/new', label: 'New Request', icon: PlusCircle },
      { path: '/dashboard/customer/requests', label: 'My Requests', icon: ListOrdered },
      { path: '/dashboard/customer/bookings', label: 'My Bookings', icon: Calendar },
      { path: '/dashboard/customer/disputes', label: 'Disputes & Support', icon: AlertOctagon },
      { path: '/dashboard/profile', label: 'Profile Settings', icon: Settings },
    ],
    SERVICE_PROVIDER: [
      { path: '/dashboard/provider', label: 'Provider Overview', icon: LayoutDashboard, end: true },
      { path: '/dashboard/provider/requests', label: 'Incoming Requests', icon: ListOrdered },
      { path: '/dashboard/provider/quotes', label: 'My Quotes', icon: FileText },
      { path: '/dashboard/provider/jobs', label: 'Active Jobs', icon: CheckSquare },
      { path: '/dashboard/provider/availability', label: 'Availability Calendar', icon: Calendar },
      { path: '/dashboard/provider/earnings', label: 'Earnings & Reviews', icon: DollarSign },
      { path: '/dashboard/provider/profile', label: 'Profile & Documents', icon: UserCheck },
    ],
    PLATFORM_ADMIN: [
      { path: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
      { path: '/dashboard/admin/users', label: 'User Management', icon: Users },
      { path: '/dashboard/admin/verification', label: 'Provider Verification', icon: ShieldCheck },
      { path: '/dashboard/admin/categories', label: 'Service Categories', icon: Tag },
      { path: '/dashboard/admin/disputes', label: 'Dispute Management', icon: AlertOctagon },
      { path: '/dashboard/admin/analytics', label: 'Analytics & Audits', icon: BarChart3 },
    ],
    OPERATIONS_MANAGER: [
      { path: '/dashboard/ops', label: 'Ops Dashboard', icon: LayoutDashboard, end: true },
      { path: '/dashboard/ops/bookings', label: 'Booking Monitoring', icon: Activity },
      { path: '/dashboard/ops/assign', label: 'Provider Assignment', icon: CheckSquare },
      { path: '/dashboard/ops/quality', label: 'Quality & Analytics', icon: BarChart3 },
    ],
    SUPPORT_AGENT: [
      { path: '/dashboard/support', label: 'Support Dashboard', icon: LayoutDashboard, end: true },
      { path: '/dashboard/support/disputes', label: 'Complaints & Disputes', icon: AlertOctagon },
    ],
  };

  const navItems = roleNavItems[user.role] || [];

  return (
    <aside className="w-64 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] m-3 mr-0 rounded-3xl cc-card">
      <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-indigo-50/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-indigo-600/30 cc-pulse-ring">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-slate-800 text-xs truncate">{user.name}</h3>
            <p className="text-[10px] text-indigo-600 font-medium truncate uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={{ animationDelay: `${i * 40}ms` }}
              className={({ isActive }) =>
                `cc-rise flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-0.5'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-100/60 hover:-translate-x-0.5'
                }`
              }
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-125 ${item.open ? '' : ''}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;