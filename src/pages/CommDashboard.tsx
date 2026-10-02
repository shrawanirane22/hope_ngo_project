import type { PageProps } from '../types';
import { useEffect, useState } from 'react';
import { getCommunicationDashboard, type CommunicationDashboard } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowRight } from 'lucide-react';

export default function CommDashboard({ navigate, messages, announcements, contacts, toast }: PageProps) {
  const [dashboard, setDashboard] = useState<CommunicationDashboard | null>(null);

  useEffect(() => {
    getCommunicationDashboard().then(setDashboard).catch(error => toast(error instanceof Error ? error.message : 'Failed to load Communication dashboard', true));
  }, [messages, announcements, contacts]);

  const unread = dashboard?.unread_messages ?? messages.filter(m => !m.read && m.folder === 'inbox').length;
  const inboxCount = dashboard?.total_messages ?? messages.filter(m => m.folder === 'inbox').length;
  const publishedAnn = dashboard?.published_announcements ?? announcements.filter(a => a.status === 'Published').length;
  const activityData = dashboard?.activity ?? [];
  const recentMessages = dashboard?.recent_messages ?? messages.filter(m => m.folder === 'inbox').slice(0, 4);
  const recentAnnouncements = dashboard?.recent_announcements ?? announcements.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value={inboxCount} sub="In inbox" onClick={() => navigate('messages')} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Unread Messages" value={unread} sub="Awaiting response" onClick={() => navigate('messages', { folder: 'inbox' })} color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="Announcements" value={announcements.length} sub={`${publishedAnn} published`} onClick={() => navigate('announcements')} color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Contacts" value={contacts.length} sub="In directory" onClick={() => navigate('contacts')} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Communication Activity</h3>
          <p className="text-xs text-slate-400 mb-4">Messages and announcements this week</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                <Bar dataKey="messages" fill="#2563EB" radius={[3, 3, 0, 0]} name="Messages" />
                <Bar dataKey="announcements" fill="#7C3AED" radius={[3, 3, 0, 0]} name="Announcements" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Recent Messages</h3>
            <button onClick={() => navigate('messages')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentMessages.map(m => (
              <button key={m.id} onClick={() => navigate('messages')} className="w-full flex gap-3 items-start hover:bg-slate-50 p-2 rounded-lg -mx-2 text-left">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">{m.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 truncate">{m.sender}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{m.subject}</p>
                </div>
                {!m.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Recent Announcements</h3>
          <button onClick={() => navigate('announcements')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentAnnouncements.map(a => (
            <button key={a.id} onClick={() => navigate('announcements')} className="text-left p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <AnnBadge status={a.status} />
                <span className="text-[10px] text-slate-400">{a.date}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2">{a.title}</p>
              <p className="text-xs text-slate-400 mt-1">{a.audience}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, onClick, color, bg }: { label: string; value: number; sub: string; onClick: () => void; color: string; bg: string }) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-left hover:shadow-md transition-shadow w-full group">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      <div className={`w-8 h-1 rounded-full ${bg.replace('bg-', 'bg-')} mt-3 group-hover:w-12 transition-all`} style={{ background: color.replace('text-', '').includes('blue') ? '#2563EB' : color.includes('rose') ? '#E11D48' : color.includes('violet') ? '#7C3AED' : '#059669' }} />
    </button>
  );
}

function AnnBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Published: 'bg-emerald-100 text-emerald-700',
    Draft: 'bg-slate-100 text-slate-600',
    Scheduled: 'bg-blue-100 text-blue-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
