import { useState, useEffect } from 'react';
import type { PageProps, User } from '../types';
import { Plus, X, Search, Eye, Pencil, UserX } from 'lucide-react';

export default function UserManagement({ users, setUsers, toast, navOpts }: PageProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff', status: 'Active' });

  useEffect(() => {
    if (navOpts.userFilter) {
      const f = navOpts.userFilter;
      if (['Active', 'Pending', 'Inactive'].includes(f)) setStatusFilter(f);
      else if (['Administrator', 'Staff', 'Coordinator', 'Volunteer'].includes(f)) setRoleFilter(f);
    }
  }, [navOpts.userFilter]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const newUser: User = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      name: form.name,
      initials,
      email: form.email,
      role: form.role as User['role'],
      status: form.status as User['status'],
      lastActive: 'Never',
    };
    setUsers(prev => [newUser, ...prev]);
    setShowAdd(false);
    setForm({ name: '', email: '', role: 'Staff', status: 'Active' });
    toast('User added successfully');
  };

  const handleEditSave = () => {
    if (!editUser) return;
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
    toast('User updated successfully');
  };

  const handleDeactivate = () => {
    if (!deactivateUser) return;
    setUsers(prev => prev.map(u => u.id === deactivateUser.id ? { ...u, status: 'Inactive' } : u));
    setDeactivateUser(null);
    toast('User deactivated');
  };

  const totals = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    pending: users.filter(u => u.status === 'Pending').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totals.total, color: 'text-slate-800' },
          { label: 'Active', value: totals.active, color: 'text-emerald-600' },
          { label: 'Pending', value: totals.pending, color: 'text-amber-600' },
          { label: 'Inactive', value: totals.inactive, color: 'text-slate-400' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex-1">Users</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All</option>
            <option>Administrator</option>
            <option>Staff</option>
            <option>Coordinator</option>
            <option>Volunteer</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Last Active</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users found</td></tr>}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{u.initials}</span>
                      </div>
                      <span className="font-medium text-slate-700 text-xs">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{u.lastActive}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewUser(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => setEditUser({ ...u })} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
                        <Pencil size={13} />
                      </button>
                      {u.status !== 'Inactive' && (
                        <button onClick={() => setDeactivateUser(u)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Deactivate">
                          <UserX size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <Modal title="Add User" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Full Name *">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" className={inp} />
            </Field>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@samridhi.org" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inp}>
                  <option>Administrator</option>
                  <option>Staff</option>
                  <option>Coordinator</option>
                  <option>Volunteer</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add User</button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{viewUser.initials}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{viewUser.name}</p>
              <RoleBadge role={viewUser.role} />
            </div>
          </div>
          <div className="space-y-3">
            {([['Email', viewUser.email], ['Role', viewUser.role], ['Status', viewUser.status], ['Last Active', viewUser.lastActive]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex gap-4">
                <span className="text-slate-500 w-24 flex-shrink-0 text-xs">{l}</span>
                <span className="text-slate-800 font-medium text-xs">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setViewUser(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">Close</button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <Field label="Full Name">
              <input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className={inp} />
            </Field>
            <Field label="Email">
              <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value as User['role'] })} className={inp}>
                  <option>Administrator</option>
                  <option>Staff</option>
                  <option>Coordinator</option>
                  <option>Volunteer</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value as User['status'] })} className={inp}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setEditUser(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Deactivate Confirm */}
      {deactivateUser && (
        <Modal title="Deactivate User" onClose={() => setDeactivateUser(null)}>
          <p className="text-sm text-slate-600">Are you sure you want to deactivate <strong>{deactivateUser.name}</strong>? They will lose access to the system.</p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setDeactivateUser(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleDeactivate} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700">Confirm Deactivate</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    Administrator: 'bg-blue-100 text-blue-700',
    Staff: 'bg-violet-100 text-violet-700',
    Coordinator: 'bg-emerald-100 text-emerald-700',
    Volunteer: 'bg-amber-100 text-amber-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[role] || 'bg-slate-100 text-slate-600'}`}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Inactive: 'bg-slate-100 text-slate-500',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

import type React from 'react';
