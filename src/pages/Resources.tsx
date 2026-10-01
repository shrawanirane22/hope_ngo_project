import { useState, useEffect } from 'react';
import type { PageProps, Resource } from '../types';
import { Plus, X, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { getResources, createResource, updateResource, deleteResource } from '../api';

const emptyForm = { name: '', category: '', quantity: '', project: '', responsiblePerson: '', status: 'Available' };

export default function Resources({ toast }: PageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewResource, setViewResource] = useState<Resource | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadResources = async () => {
    try {
      setResources(await getResources());
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const counts = {
    total: resources.length,
    available: resources.filter(r => r.status === 'Available').length,
    assigned: resources.filter(r => r.status === 'Assigned').length,
    maintenance: resources.filter(r => r.status === 'Maintenance').length,
  };

  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.project.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (r: Resource) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      category: r.category,
      quantity: String(r.quantity),
      project: r.project,
      responsiblePerson: r.responsiblePerson,
      status: r.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.quantity) return;
    const data = {
      name: form.name,
      category: form.category,
      quantity: parseInt(form.quantity),
      project: form.project || 'Unassigned',
      responsiblePerson: form.responsiblePerson || 'TBD',
      status: form.status as Resource['status'],
    };
    try {
      if (editingId) {
        await updateResource(editingId, data);
        toast('Resource updated successfully');
      } else {
        await createResource(data);
        toast('Resource added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadResources();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  const handleDelete = async (r: Resource) => {
    if (!window.confirm(`Delete resource "${r.name}"?`)) return;
    try {
      await deleteResource(r.id);
      toast('Resource deleted');
      loadResources();
    } catch (err) {
      toast((err as Error).message, true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: counts.total, color: 'bg-blue-50 text-blue-600' },
          { label: 'Available', value: counts.available, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Assigned', value: counts.assigned, color: 'bg-violet-50 text-violet-600' },
          { label: 'Maintenance', value: counts.maintenance, color: 'bg-amber-50 text-amber-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color.split(' ')[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex-1">Resources</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All</option>
            <option>Available</option>
            <option>Assigned</option>
            <option>Maintenance</option>
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add Resource
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Resource', 'Category', 'Qty', 'Project', 'Responsible', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">{loading ? 'Loading...' : 'No resources found'}</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700 text-xs">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.category}</td>
                  <td className="px-4 py-3 text-slate-700 text-xs font-semibold">{r.quantity}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.project}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.responsiblePerson}</td>
                  <td className="px-4 py-3"><ResourceBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewResource(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Eye size={13} /></button>
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={13} /></button>
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
        <Modal title={editingId ? 'Edit Resource' : 'Add Resource'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Resource Name *">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Medical Kits" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category *">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                  <option value="">Select</option>
                  <option>IT Equipment</option>
                  <option>Medical</option>
                  <option>Facility</option>
                  <option>Infrastructure</option>
                  <option>AV Equipment</option>
                  <option>Transport</option>
                  <option>Supplies</option>
                </select>
              </Field>
              <Field label="Quantity *">
                <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" className={inp} />
              </Field>
            </div>
            <Field label="Assigned Project">
              <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} className={inp}>
                <option value="">Select project</option>
                <option>Rural Education Initiative</option>
                <option>Women Empowerment Program</option>
                <option>Healthcare Outreach</option>
                <option>Digital Literacy Drive</option>
                <option>Clean Water Project</option>
                <option>Multiple Projects</option>
              </select>
            </Field>
            <Field label="Responsible Person">
              <input value={form.responsiblePerson} onChange={e => setForm({ ...form, responsiblePerson: e.target.value })} placeholder="Full name" className={inp} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                <option>Available</option>
                <option>Assigned</option>
                <option>Maintenance</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{editingId ? 'Save Changes' : 'Add Resource'}</button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewResource && (
        <Modal title="Resource Details" onClose={() => setViewResource(null)}>
          <div className="space-y-3 text-sm">
            {([['Name', viewResource.name], ['Category', viewResource.category], ['Quantity', String(viewResource.quantity)], ['Project', viewResource.project], ['Responsible', viewResource.responsiblePerson], ['Status', viewResource.status]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex gap-4">
                <span className="text-slate-500 w-28 flex-shrink-0 text-xs">{l}</span>
                <span className="text-slate-800 font-medium text-xs">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setViewResource(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ResourceBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: 'bg-emerald-100 text-emerald-700',
    Assigned: 'bg-blue-100 text-blue-700',
    Maintenance: 'bg-amber-100 text-amber-700',
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
