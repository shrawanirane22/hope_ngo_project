import { useState } from 'react';
import type { PageProps } from '../types';
import { Building, Bell, Shield, Database, Camera, Eye, EyeOff } from 'lucide-react';

export default function Settings({ toast }: PageProps) {
  const [org, setOrg] = useState({ name: 'Hope Foundation', address: '123, NGO Hub, Maharashtra', contact: '+91 22 2640 0000', website: 'www.hopefoundation.org' });
  const [notifs, setNotifs] = useState({ messages: true, announcements: true, budgetAlerts: true, expenseAlerts: false });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions] = useState([
    { device: 'Chrome on Windows 11', location: 'Mumbai, India', time: 'Current session', active: true },
    { device: 'Safari on iPhone 14', location: 'Pune, India', time: '2 days ago', active: false },
  ]);

  const handleSaveOrg = () => toast('Organization profile updated successfully');
  const handleSaveNotifs = () => toast('Notification preferences saved');
  const handleChangePw = () => {
    if (!pw.current || !pw.newPw || pw.newPw !== pw.confirm) { toast('Please fill all fields and ensure passwords match'); return; }
    setPw({ current: '', newPw: '', confirm: '' });
    toast('Password changed successfully');
  };
  const handleExport = () => toast('Data export initiated – you will receive an email shortly');
  const handleBackup = () => toast('Backup created successfully');

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Organization Profile */}
      <Section icon={<Building size={16} />} title="Organization Profile" subtitle="NGO details and branding">
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Logo</p>
              <p className="text-xs text-slate-400 mt-0.5">Recommended: 256×256 PNG</p>
              <button className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline">
                <Camera size={12} /> Upload new logo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="NGO Name">
              <input value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} className={inp} />
            </Field>
            <Field label="Website">
              <input value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} className={inp} />
            </Field>
          </div>
          <Field label="Address">
            <textarea value={org.address} onChange={e => setOrg({ ...org, address: e.target.value })} rows={2} className={`${inp} resize-none`} />
          </Field>
          <Field label="Contact Number">
            <input value={org.contact} onChange={e => setOrg({ ...org, contact: e.target.value })} className={inp} />
          </Field>
          <div className="flex justify-end">
            <button onClick={handleSaveOrg} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Save Profile</button>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={16} />} title="Notifications" subtitle="Control what alerts you receive">
        <div className="space-y-4">
          {[
            { key: 'messages' as const, label: 'New Message Notifications', desc: 'Get notified when you receive a new message' },
            { key: 'announcements' as const, label: 'Announcement Notifications', desc: 'Get notified when a new announcement is published' },
            { key: 'budgetAlerts' as const, label: 'Budget Alerts', desc: 'Alert when a budget exceeds 75% utilisation' },
            { key: 'expenseAlerts' as const, label: 'Expense Alerts', desc: 'Notify when new expenses are added for approval' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-700">{n.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
              </div>
              <Toggle
                checked={notifs[n.key]}
                onChange={v => setNotifs({ ...notifs, [n.key]: v })}
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveNotifs} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Save Preferences</button>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section icon={<Shield size={16} />} title="Security" subtitle="Password and access controls">
        <div className="space-y-5">
          {/* Change password */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Change Password</h4>
            <div className="space-y-3">
              <Field label="Current Password">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} placeholder="••••••••" className={`${inp} pr-10`} />
                  <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="New Password">
                  <input type="password" value={pw.newPw} onChange={e => setPw({ ...pw, newPw: e.target.value })} placeholder="••••••••" className={inp} />
                </Field>
                <Field label="Confirm Password">
                  <input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} placeholder="••••••••" className={inp} />
                </Field>
              </div>
              <div className="flex justify-start">
                <button onClick={handleChangePw} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Update Password</button>
              </div>
            </div>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <Toggle checked={twoFactor} onChange={v => { setTwoFactor(v); toast(v ? '2FA enabled' : '2FA disabled'); }} />
          </div>

          {/* Sessions */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Login Sessions</h4>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${s.active ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100'}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{s.device}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.location} · {s.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.active && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
                    {!s.active && <button onClick={() => toast('Session terminated')} className="text-xs text-rose-600 hover:underline">End</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Data Management */}
      <Section icon={<Database size={16} />} title="Data Management" subtitle="Import, export, and backup">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-center" onClick={() => toast('Import wizard opened')}>
            <Database size={24} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Import Data</span>
            <span className="text-xs text-slate-400">CSV / Excel files</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-center" onClick={handleExport}>
            <Database size={24} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Export Data</span>
            <span className="text-xs text-slate-400">Download as CSV</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-center" onClick={handleBackup}>
            <Database size={24} className="text-violet-600" />
            <span className="text-sm font-medium text-slate-700">Backup</span>
            <span className="text-xs text-slate-400">Full system backup</span>
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
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
