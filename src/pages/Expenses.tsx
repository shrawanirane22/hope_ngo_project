import { useState, useEffect } from 'react';
import type { PageProps, Expense } from '../types';
import { Plus, X, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense, formatDate, expenseCode } from '../api';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const emptyForm = { project: '', category: '', date: '', description: '', amount: '', paymentMethod: 'Bank Transfer', status: 'Pending' };

export default function Expenses({ toast }: PageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewExp, setViewExp] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadExpenses = async () => {
    try {
      setExpenses(await getExpenses());
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === 'Pending').length;
  // "This Month" = the most recent month that has expenses (dates look like 2025-02-05)
  const latestMonth = expenses.reduce((latest, e) => (e.date.slice(0, 7) > latest ? e.date.slice(0, 7) : latest), '');
  const thisMonth = expenses.filter(e => e.date.startsWith(latestMonth)).reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    const match = e.project.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || expenseCode(e.id).toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return match && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({
      project: e.project,
      category: e.category,
      date: e.date,
      description: e.description,
      amount: String(e.amount),
      paymentMethod: e.paymentMethod,
      status: e.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.project || !form.category || !form.amount || !form.date) return;
    const data = {
      date: form.date,
      project: form.project,
      category: form.category,
      description: form.description,
      amount: parseInt(form.amount),
      paymentMethod: form.paymentMethod,
      status: form.status as Expense['status'],
    };
    try {
      if (editingId) {
        await updateExpense(editingId, data);
        toast('Expense updated successfully');
      } else {
        await createExpense(data);
        toast('Expense added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadExpenses();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  const handleDelete = async (e: Expense) => {
    if (!window.confirm(`Delete expense ${expenseCode(e.id)}?`)) return;
    try {
      await deleteExpense(e.id);
      toast('Expense deleted');
      loadExpenses();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses', value: fmt(total), color: 'text-slate-800' },
          { label: 'This Month', value: fmt(thisMonth), color: 'text-blue-600' },
          { label: 'Pending Approval', value: pending + ' entries', color: 'text-amber-600' },
          { label: 'Approved Amount', value: fmt(approved), color: 'text-emerald-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex-1">Expense Records</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add Expense
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Date', 'Project', 'Category', 'Description', 'Amount', 'Payment', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">{loading ? 'Loading...' : 'No expenses found'}</td></tr>}
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{expenseCode(e.id)}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-slate-700 text-xs font-medium">{e.project}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{e.category}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">{e.description}</td>
                  <td className="px-4 py-3 text-slate-800 text-xs font-semibold whitespace-nowrap">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{e.paymentMethod}</td>
                  <td className="px-4 py-3"><ExpBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewExp(e)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Eye size={13} /></button>
                      <button onClick={() => openEdit(e)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <Modal title={editingId ? 'Edit Expense' : 'Add Expense'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Project *">
              <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} className={inp}>
                <option value="">Select project</option>
                <option>Rural Education Initiative</option>
                <option>Women Empowerment Program</option>
                <option>Healthcare Outreach</option>
                <option>Digital Literacy Drive</option>
                <option>Clean Water Project</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category *">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                  <option value="">Select</option>
                  <option>Personnel</option>
                  <option>Training</option>
                  <option>Medical</option>
                  <option>Equipment</option>
                  <option>Infrastructure</option>
                  <option>Travel</option>
                  <option>Miscellaneous</option>
                </select>
              </Field>
              <Field label="Date *">
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inp} />
              </Field>
            </div>
            <Field label="Description">
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹) *">
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" className={inp} />
              </Field>
              <Field label="Payment Method">
                <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className={inp}>
                  <option>Bank Transfer</option>
                  <option>Online Payment</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                </select>
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save Expense</button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewExp && (
        <Modal title="Expense Details" onClose={() => setViewExp(null)}>
          <div className="space-y-3">
            {([['ID', expenseCode(viewExp.id)], ['Date', formatDate(viewExp.date)], ['Project', viewExp.project], ['Category', viewExp.category], ['Description', viewExp.description], ['Amount', fmt(viewExp.amount)], ['Payment', viewExp.paymentMethod], ['Status', viewExp.status]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex gap-4">
                <span className="text-slate-500 w-28 flex-shrink-0 text-xs">{l}</span>
                <span className="text-slate-800 font-medium text-xs">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setViewExp(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExpBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-rose-100 text-rose-700',
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
