import { useState, useEffect } from 'react';
import type { PageProps, DashboardData } from '../types';
import { getDashboard, formatDate } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, ArrowRight } from 'lucide-react';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ResourceDashboard({ navigate, toast }: PageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setData(await getDashboard());
      } catch (err) {
        toast((err as Error).message, true);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 text-center text-sm text-slate-400">
        {loading ? 'Loading dashboard...' : 'Could not load dashboard data. Is the backend running?'}
      </div>
    );
  }

  const pieData = [
    { name: 'Spent', value: data.totalSpent },
    { name: 'Remaining', value: data.totalRemaining },
  ];
  const PIE_COLORS = ['#2563EB', '#E2E8F0'];
  const allocatedPct = data.totalBudget > 0 ? Math.round((data.totalAllocated / data.totalBudget) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Budget"
          value={fmt(data.totalBudget)}
          icon={<DollarSign size={20} className="text-blue-600" />}
          bg="bg-blue-50"
          onClick={() => navigate('budget-management')}
          sub={data.financialYear ? `FY ${data.financialYear}` : 'No budgets yet'}
        />
        <StatCard
          label="Allocated"
          value={fmt(data.totalAllocated)}
          icon={<TrendingUp size={20} className="text-violet-600" />}
          bg="bg-violet-50"
          onClick={() => navigate('budget-management')}
          sub={`${allocatedPct}% of total`}
        />
        <StatCard
          label="Spent"
          value={fmt(data.totalSpent)}
          icon={<TrendingDown size={20} className="text-rose-600" />}
          bg="bg-rose-50"
          onClick={() => navigate('expenses')}
          sub={`${data.utilisationPercent}% of allocated`}
        />
        <StatCard
          label="Remaining"
          value={fmt(data.totalRemaining)}
          icon={<Package size={20} className="text-emerald-600" />}
          bg="bg-emerald-50"
          onClick={() => navigate('budget-management')}
          sub="Available balance"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Budget Utilisation</h3>
          <p className="text-xs text-slate-400 mb-4">{data.financialYear ? `FY ${data.financialYear}` : 'No budgets yet'}</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-1">
            <p className="text-2xl font-bold text-slate-800">{data.utilisationPercent}%</p>
            <p className="text-xs text-slate-400">Budget utilised</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Monthly Expenses</h3>
          <p className="text-xs text-slate-400 mb-4">{data.monthlyLabel}</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyExpenses} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget table + Resource summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Project Budgets</h3>
            <button onClick={() => navigate('budget-management')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 font-medium">Project</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Allocated</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Spent</th>
                  <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Progress</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.projectBudgets.map(b => {
                  const pct = b.percent;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate('budget-management')}>
                      <td className="px-5 py-3 text-slate-700 text-xs font-medium">{b.project}</td>
                      <td className="px-4 py-3 text-right text-slate-600 text-xs">{fmt(b.allocated)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 text-xs">{fmt(b.spent)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${pct > 75 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resource summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Resource Allocation</h3>
            <button onClick={() => navigate('resources')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Available', count: data.resourceSummary.available, color: 'bg-emerald-500', total: data.resourceSummary.total },
              { label: 'Assigned', count: data.resourceSummary.assigned, color: 'bg-blue-500', total: data.resourceSummary.total },
              { label: 'Maintenance', count: data.resourceSummary.maintenance, color: 'bg-amber-500', total: data.resourceSummary.total },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-600">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-700">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h4>
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex gap-2.5 items-start py-1.5 border-b border-slate-50 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${a.type === 'expense' ? 'bg-rose-400' : a.type === 'budget' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 leading-tight">{a.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(a.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, onClick, sub }: { label: string; value: string; icon: React.ReactNode; bg: string; onClick: () => void; sub: string }) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-left hover:shadow-md transition-shadow w-full group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'On Track': 'bg-emerald-100 text-emerald-700',
    'At Risk': 'bg-amber-100 text-amber-700',
    'Over Budget': 'bg-rose-100 text-rose-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

import type React from 'react';
