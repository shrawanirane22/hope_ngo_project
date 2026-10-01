import type { PageProps } from '../types';
import { adminActivityData } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, ShieldCheck, Activity, Clock, ArrowRight } from 'lucide-react';

export default function AdminDashboard({ navigate, users }: PageProps) {
  const total = users.length;
  const admins = users.filter(u => u.role === 'Administrator').length;
  const active = users.filter(u => u.status === 'Active').length;
  const pending = users.filter(u => u.status === 'Pending').length;

  const recentActivity = [
    { action: 'New user Suresh Yadav registered – pending approval', time: '2 hours ago', type: 'user' },
    { action: 'Permissions updated for Coordinator role', time: '4 hours ago', type: 'role' },
    { action: 'User Fatima Khan deactivated', time: '1 day ago', type: 'user' },
    { action: 'Settings updated – notification preferences', time: '2 days ago', type: 'settings' },
    { action: 'New admin Ananya Krishnamurthy added', time: '3 days ago', type: 'user' },
    { action: 'Backup completed successfully', time: '5 days ago', type: 'system' },
  ];

  const roleBreakdown = [
    { role: 'Administrator', count: users.filter(u => u.role === 'Administrator').length, color: 'bg-blue-500' },
    { role: 'Staff', count: users.filter(u => u.role === 'Staff').length, color: 'bg-violet-500' },
    { role: 'Coordinator', count: users.filter(u => u.role === 'Coordinator').length, color: 'bg-emerald-500' },
    { role: 'Volunteer', count: users.filter(u => u.role === 'Volunteer').length, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} className="text-blue-600" />} bg="bg-blue-50" label="Total Users" value={total} onClick={() => navigate('user-management')} sub="All registered users" />
        <StatCard icon={<ShieldCheck size={20} className="text-violet-600" />} bg="bg-violet-50" label="Administrators" value={admins} onClick={() => navigate('user-management', { userFilter: 'Administrator' })} sub="Full access" />
        <StatCard icon={<Activity size={20} className="text-emerald-600" />} bg="bg-emerald-50" label="Active Users" value={active} onClick={() => navigate('user-management', { userFilter: 'Active' })} sub="Currently active" />
        <StatCard icon={<Clock size={20} className="text-amber-600" />} bg="bg-amber-50" label="Pending Access" value={pending} onClick={() => navigate('user-management', { userFilter: 'Pending' })} sub="Awaiting approval" />
      </div>

      {/* Chart + Role breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">User Activity</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly logins and admin actions</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminActivityData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                <Bar dataKey="logins" fill="#2563EB" radius={[3, 3, 0, 0]} name="Logins" />
                <Bar dataKey="actions" fill="#7C3AED" radius={[3, 3, 0, 0]} name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Users by Role</h3>
            <button onClick={() => navigate('user-management')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {roleBreakdown.map(r => (
              <div key={r.role}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">{r.role}</span>
                  <span className="text-xs font-semibold text-slate-700">{r.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className={`h-1.5 rounded-full ${r.color}`} style={{ width: `${(r.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Active rate</span>
              <span className="text-sm font-bold text-emerald-600">{Math.round((active / total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mt-1">
              <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(active / total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Recent Admin Activity</h3>
        <div className="space-y-0">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex gap-4 items-start py-3 border-b border-slate-50 last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${a.type === 'user' ? 'bg-blue-500' : a.type === 'role' ? 'bg-violet-500' : a.type === 'settings' ? 'bg-amber-500' : 'bg-slate-400'}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-700">{a.action}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, label, value, onClick, sub }: { icon: React.ReactNode; bg: string; label: string; value: number; onClick: () => void; sub: string }) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-left hover:shadow-md transition-shadow w-full group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </button>
  );
}

import type React from 'react';
