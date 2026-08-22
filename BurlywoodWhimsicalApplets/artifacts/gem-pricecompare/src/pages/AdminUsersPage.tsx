import React, { useState, useMemo } from 'react';
import { useAuth, type User, type UserRole, type UserStatus } from '@/lib/auth-context';
import { Link } from 'wouter';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Key,
  Mail,
  UserCheck,
  Activity,
  ArrowUpDown,
  Lock,
  RefreshCw,
  Plus,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export function AdminUsersPage() {
  const {
    users,
    currentUser,
    logs,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    switchUser,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'logs'>('directory');

  // Form states for Add User
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    role: 'Procurement Officer' as UserRole,
    department: 'CHARUSAT University / IT Procurement',
    status: 'Active' as UserStatus,
    password: '',
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const procurementCount = users.filter((u) => u.role === 'Procurement Officer' || u.role === 'Department Buyer').length;
  const adminCount = users.filter((u) => u.role === 'Administrator').length;

  const handleOpenAddModal = () => {
    const nextIdNumber = users.length + 100 + 1;
    setFormData({
      id: `BUY-${nextIdNumber}`,
      name: '',
      username: '',
      email: '',
      role: 'Procurement Officer',
      department: 'Central Procurement Wing',
      status: 'Active',
      password: 'gem' + Math.floor(100 + Math.random() * 900),
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.id.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    addUser({
      id: formData.id.trim().toUpperCase(),
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim() || `${formData.username.toLowerCase()}@gem.gov.in`,
      role: formData.role,
      department: formData.department.trim(),
      status: formData.status,
      password: formData.password || 'buyer123',
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      department: editingUser.department,
      status: editingUser.status,
      password: editingUser.password,
    });

    setEditingUser(null);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      deleteUser(deletingUserId);
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Procurement Officer':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'Financial Auditor':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Department Buyer':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="page-intro">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div>
            <div className="eyebrow flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-400" />
              SYSTEM ADMINISTRATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              User & Access Control Desk
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage authorized procurement officers, departmental buyers, financial auditors, and access privileges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary shadow-lg shadow-teal-500/20"
              data-testid="button-add-user"
            >
              <UserPlus size={16} />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for User Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card kpi-teal">
          <div className="kpi-top">
            <span>Total Registered Users</span>
            <span className="kpi-icon"><Users size={16} /></span>
          </div>
          <strong className="text-2xl font-bold text-white">{totalUsers}</strong>
          <small className="text-teal-300">Across 4 Gov/University Wings</small>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-top">
            <span>Active Buyer Desks</span>
            <span className="kpi-icon"><UserCheck size={16} /></span>
          </div>
          <strong className="text-2xl font-bold text-white">{activeCount}</strong>
          <small className="text-emerald-300">{Math.round((activeCount / totalUsers) * 100)}% Operational readiness</small>
        </div>

        <div className="kpi-card kpi-blue">
          <div className="kpi-top">
            <span>Procurement Officers</span>
            <span className="kpi-icon"><Building size={16} /></span>
          </div>
          <strong className="text-2xl font-bold text-white">{procurementCount}</strong>
          <small className="text-blue-300">Evaluating GeM vs Market</small>
        </div>

        <div className="kpi-card kpi-amber">
          <div className="kpi-top">
            <span>System Administrators</span>
            <span className="kpi-icon"><Shield size={16} /></span>
          </div>
          <strong className="text-2xl font-bold text-white">{adminCount}</strong>
          <small className="text-amber-300">Full audit & catalog control</small>
        </div>
      </div>

      {/* Navigation Tabs (Directory vs Logs) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users size={16} />
            <span>User Directory ({filteredUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity size={16} />
            <span>Audit & Access Logs ({logs.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Active Admin Session:</span>
          <strong className="text-teal-400">{currentUser?.name}</strong>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Search & Filter Toolbar */}
          <div className="panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 border-slate-800">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by name, User ID, username, email, or department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <option value="All">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Procurement Officer">Procurement Officer</option>
                  <option value="Financial Auditor">Financial Auditor</option>
                  <option value="Department Buyer">Department Buyer</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="panel overflow-hidden border-slate-800 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User / Officer</th>
                    <th className="py-3 px-4">User ID & Login</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department / Org</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        <Users size={32} className="mx-auto mb-2 text-slate-600" />
                        No users match the search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                              {user.avatarInitials}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                {user.name}
                                {user.id === currentUser?.id && (
                                  <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-mono">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail size={11} /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs text-teal-300 font-semibold">{user.id}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-300 max-w-[200px] truncate" title={user.department}>
                            {user.department}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                              user.status === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                            title="Click to toggle Active / Suspended status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            {user.status}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                          {user.lastLogin}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
                              title="Edit user details"
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => switchUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition text-xs font-semibold"
                              title="Switch to this user session"
                            >
                              <RefreshCw size={14} />
                            </button>

                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => setDeletingUserId(user.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                title="Delete user"
                                data-testid={`button-delete-user-${user.id}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Audit & Activity Logs Tab */
        <div className="panel bg-slate-900/80 border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">System Security & Access Audit Stream</h3>
              <p className="text-xs text-slate-400">Chronological log of administrative actions, user creation, privilege modifications and login sessions.</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg text-slate-300">
              {logs.length} Total Events
            </span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    log.type === 'create' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.type === 'status' ? 'bg-amber-500/20 text-amber-400' :
                    log.type === 'delete' ? 'bg-rose-500/20 text-rose-400' :
                    log.type === 'update' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-teal-500/20 text-teal-400'
                  }`}>
                    {log.type === 'create' ? <UserPlus size={15} /> :
                     log.type === 'status' ? <ShieldAlert size={15} /> :
                     log.type === 'delete' ? <Trash2 size={15} /> :
                     log.type === 'update' ? <Edit2 size={15} /> :
                     <Key size={15} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{log.action}</span>
                      <span className="text-slate-400 font-normal">on</span>
                      <span className="text-teal-300 font-semibold">{log.targetUser}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{log.details}</p>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>By: <strong className="text-slate-300">{log.actor}</strong></span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0 bg-slate-900/60 px-2 py-1 rounded">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create New User Account</h3>
                  <p className="text-xs text-slate-400">Add an authorized procurement official or auditor.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">User ID / Code *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. BUY-205"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. karan"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Karan Patel"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Department Buyer">Department Buyer</option>
                    <option value="Financial Auditor">Financial Auditor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. gem123"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. karan.patel@charusat.ac.in"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. CHARUSAT / Computer Engineering Desk"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  <Check size={14} />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit User: {editingUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {editingUser.id} · @{editingUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Department Buyer">Department Buyer</option>
                    <option value="Financial Auditor">Financial Auditor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reset Password</label>
                <input
                  type="text"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Are you sure you want to delete user ID <code className="text-rose-300">{deletingUserId}</code>? This action will revoke all portal access and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/30"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
