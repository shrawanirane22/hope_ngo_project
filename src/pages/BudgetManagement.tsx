import { useState, useEffect } from 'react';
import type { PageProps, Budget } from '../types';
import { Plus, X, Search, Pencil, Eye, Trash2 } from 'lucide-react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const emptyForm = { project: '', category: '', amount: '', financialYear: '2024-25', description: '', status: 'On Track' };

export default function BudgetManagement({ toast }: PageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);
  const [viewBudget, setViewBudget] = useState<Budget | null>(null);

  const loadBudgets = async () => {
    try {
      setBudgets(await getBudgets());
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const filtered = budgets.filter(b => {
    const matchSearch = b.project.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditingId(b.id);
    setForm({
      project: b.project,
      category: b.category,
      amount: String(b.allocated),
      financialYear: b.financialYear,
      description: b.description,
      status: b.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.project || !form.category || !form.amount) return;
    const data = {
      project: form.project,
      category: form.category,
      allocated: parseInt(form.amount),
      financialYear: form.financialYear,
      description: form.description,
    };
    try {
      if (editingId) {
        await updateBudget(editingId, { ...data, status: form.status as Budget['status'] });
        toast('Budget updated successfully');
      } else {
        await createBudget(data);
        toast('Budget added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadBudgets();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  const handleDelete = async (b: Budget) => {
    if (!window.confirm(`Delete the ${b.category} budget for ${b.project}?`)) return;
    try {
      await deleteBudget(b.id);
      toast('Budget deleted');
      loadBudgets();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500">Total Allocated</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{fmt(totalAllocated)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{fmt(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500">Total Remaining</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(totalRemaining)}</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex-1">Budget Entries</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search budgets..."
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>On Track</option>
            <option>At Risk</option>
            <option>Over Budget</option>
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> Add Budget
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">Project</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Category</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Allocated</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Spent</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Remaining</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">FY</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">{loading ? 'Loading...' : 'No budgets found'}</td></tr>
              )}
              {filtered.map(b => {
                const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-700 font-medium text-xs">{b.project}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.category}</td>
                    <td className="px-4 py-3 text-right text-slate-700 text-xs font-medium">{fmt(b.allocated)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{fmt(b.spent)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 text-xs font-medium">{fmt(b.remaining)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{b.financialYear}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={b.status} />
                        <div className="h-1 w-16 bg-slate-100 rounded-full">
                          <div className={`h-1 rounded-full ${pct > 75 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewBudget(b)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                          <Eye size={13} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit" onClick={() => openEdit(b)}>
                          <Pencil size={13} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete" onClick={() => handleDelete(b)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showModal && (
        <Modal title={editingId ? 'Edit Budget' : 'Add Budget'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Project *">
              <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} className={inputCls}>
                <option value="">Select project</option>
                <option>Rural Education Initiative</option>
                <option>Women Empowerment Program</option>
                <option>Healthcare Outreach</option>
                <option>Digital Literacy Drive</option>
                <option>Clean Water Project</option>
              </select>
            </Field>
            <Field label="Budget Category *">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                <option value="">Select category</option>
                <option>Personnel</option>
                <option>Training</option>
                <option>Medical Supplies</option>
                <option>Equipment</option>
                <option>Infrastructure</option>
                <option>Travel</option>
                <option>Miscellaneous</option>
              </select>
            </Field>
            <Field label="Amount (₹) *">
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 50000" className={inputCls} />
            </Field>
            <Field label="Financial Year">
              <select value={form.financialYear} onChange={e => setForm({ ...form, financialYear: e.target.value })} className={inputCls}>
                <option>2024-25</option>
                <option>2025-26</option>
              </select>
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Budget purpose..." className={`${inputCls} resize-none`} />
            </Field>
            {editingId && (
              <Field label="Status">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option>On Track</option>
                  <option>At Risk</option>
                  <option>Over Budget</option>
                </select>
              </Field>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save Budget</button>
          </div>
        </Modal>
      )}

      {/* View modal */}
      {viewBudget && (
        <Modal title="Budget Details" onClose={() => setViewBudget(null)}>
          <div className="space-y-3 text-sm">
            <Row label="Project" value={viewBudget.project} />
            <Row label="Category" value={viewBudget.category} />
            <Row label="Allocated" value={fmt(viewBudget.allocated)} />
            <Row label="Spent" value={fmt(viewBudget.spent)} />
            <Row label="Remaining" value={fmt(viewBudget.remaining)} />
            <Row label="Financial Year" value={viewBudget.financialYear} />
            <Row label="Status" value={viewBudget.status} />
            {viewBudget.description && <Row label="Description" value={viewBudget.description} />}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setViewBudget(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">Close</button>
          </div>
        </Modal>
      )}
    </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-slate-500 w-28 flex-shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-slate-800 font-medium text-xs">{value}</span>
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

import type React from 'react';
