import { useState } from 'react';
import type { PageProps } from '../types';

type Permission = { view: boolean; add: boolean; edit: boolean; delete: boolean };
type RolePerms = Record<string, Record<string, Permission>>;

const ROLES = ['Administrator', 'Staff', 'Coordinator', 'Volunteer'];
const MODULES = ['Resource & Budget', 'Communication', 'Admin'];
const PERMS = ['view', 'add', 'edit', 'delete'] as const;

const defaultPerms = (): RolePerms => ({
  Administrator: {
    'Resource & Budget': { view: true, add: true, edit: true, delete: true },
    'Communication': { view: true, add: true, edit: true, delete: true },
    'Admin': { view: true, add: true, edit: true, delete: true },
  },
  Staff: {
    'Resource & Budget': { view: true, add: true, edit: true, delete: false },
    'Communication': { view: true, add: true, edit: true, delete: false },
    'Admin': { view: false, add: false, edit: false, delete: false },
  },
  Coordinator: {
    'Resource & Budget': { view: true, add: false, edit: false, delete: false },
    'Communication': { view: true, add: true, edit: true, delete: false },
    'Admin': { view: false, add: false, edit: false, delete: false },
  },
  Volunteer: {
    'Resource & Budget': { view: true, add: false, edit: false, delete: false },
    'Communication': { view: true, add: false, edit: false, delete: false },
    'Admin': { view: false, add: false, edit: false, delete: false },
  },
});

export default function RolesAccess({ toast }: PageProps) {
  const [perms, setPerms] = useState<RolePerms>(defaultPerms());
  const [activeRole, setActiveRole] = useState('Administrator');

  const toggle = (module: string, perm: typeof PERMS[number]) => {
    setPerms(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [module]: {
          ...prev[activeRole][module],
          [perm]: !prev[activeRole][module][perm],
        },
      },
    }));
  };

  const handleSave = () => {
    toast('Permissions updated successfully');
  };

  const roleColors: Record<string, string> = {
    Administrator: 'bg-blue-100 text-blue-700 border-blue-200',
    Staff: 'bg-violet-100 text-violet-700 border-violet-200',
    Coordinator: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Volunteer: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const activeRolePerms = perms[activeRole];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-800">Roles & Permissions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure what each role can access and do</p>
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium">
            Save Permissions
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 mb-6">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeRole === role
                  ? roleColors[role]
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Permissions matrix */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium w-48">Module</th>
                {PERMS.map(p => (
                  <th key={p} className="text-center px-6 py-3 text-xs text-slate-500 font-medium capitalize">{p}</th>
                ))}
                <th className="text-center px-5 py-3 text-xs text-slate-500 font-medium">Full Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MODULES.map(mod => {
                const mp = activeRolePerms[mod];
                const allTrue = PERMS.every(p => mp[p]);
                return (
                  <tr key={mod} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">{mod}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {PERMS.filter(p => mp[p]).length} of 4 permissions
                      </p>
                    </td>
                    {PERMS.map(perm => (
                      <td key={perm} className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggle(mod, perm)}
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors border ${
                            mp[perm]
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {mp[perm] && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                    ))}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => {
                          setPerms(prev => ({
                            ...prev,
                            [activeRole]: {
                              ...prev[activeRole],
                              [mod]: { view: !allTrue, add: !allTrue, edit: !allTrue, delete: !allTrue },
                            },
                          }));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${allTrue ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${allTrue ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span>Permission granted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white border border-slate-300" />
            <span>Permission denied</span>
          </div>
        </div>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { role: 'Administrator', desc: 'Full access to all modules. Can manage users and system settings.', color: 'border-t-blue-500' },
          { role: 'Staff', desc: 'Can manage resources, budgets, and communication. No admin access.', color: 'border-t-violet-500' },
          { role: 'Coordinator', desc: 'View-only access to resources. Can send messages and announcements.', color: 'border-t-emerald-500' },
          { role: 'Volunteer', desc: 'Limited read-only access. Can view resources and messages only.', color: 'border-t-amber-500' },
        ].map(r => (
          <div key={r.role} className={`bg-white rounded-xl shadow-sm border border-slate-100 border-t-2 ${r.color} p-4`}>
            <p className="font-semibold text-slate-800 text-sm">{r.role}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
            <p className="text-xs text-slate-400 mt-2">
              {Object.values(perms[r.role]).reduce((sum, mp) => sum + PERMS.filter(p => mp[p]).length, 0)} / {MODULES.length * PERMS.length} permissions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
