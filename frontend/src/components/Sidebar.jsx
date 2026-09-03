import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ListOrdered, Sparkles, Calendar, FileText,
  MessageSquare, Star, UserCheck, ShieldCheck, Tag, AlertOctagon, BarChart3,
  CheckSquare, DollarSign, Clock, HelpCircle, Users, Activity, Settings
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
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-slate-800 text-xs truncate">{user.name}</h3>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
