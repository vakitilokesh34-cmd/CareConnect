import React, { useEffect, useState } from 'react';
import { Users, Shield, Lock, Unlock } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: roleFilter || undefined } });
      if (res.data.success) setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/users/${id}/status`, { isActive: newStatus });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isActive: newStatus } : u)));
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading user registry..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Govern user access, roles, and active state across the platform.</p>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All User Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SERVICE_PROVIDER">Service Provider</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
          <option value="OPERATIONS_MANAGER">Operations Manager</option>
          <option value="SUPPORT_AGENT">Support Agent</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{u.name}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {u.isActive !== false ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    {u.isActive !== false ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
