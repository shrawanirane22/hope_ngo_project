import { useState } from 'react';
import type { PageProps, Announcement } from '../types';
import { Plus, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { createAnnouncement, deleteAnnouncement, updateAnnouncement } from '../api';

export default function Announcements({ announcements, setAnnouncements, toast }: PageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewAnn, setViewAnn] = useState<Announcement | null>(null);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', audience: '', message: '', date: '', status: 'Draft' });

  const counts = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'Published').length,
    drafts: announcements.filter(a => a.status === 'Draft').length,
    scheduled: announcements.filter(a => a.status === 'Scheduled').length,
  };

  const resetForm = () => {
    setForm({ title: '', audience: '', message: '', date: '', status: 'Draft' });
  };

  const handlePublish = async () => {
    if (!form.title || !form.message) return;
    try {
      const newAnn = await createAnnouncement({
        title: form.title,
        audience: form.audience || 'All Staff',
        message: form.message,
        date: form.date || undefined,
        status: 'Published',
      });
      setAnnouncements(prev => [newAnn, ...prev]);
      setShowCreate(false);
      resetForm();
      toast('Announcement published successfully');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to publish announcement', true);
    }
  };

  const handleDraft = async () => {
    if (!form.title) return;
    try {
      const newAnn = await createAnnouncement({
        title: form.title,
        audience: form.audience || 'All Staff',
        message: form.message,
        date: form.date || undefined,
        status: 'Draft',
      });
      setAnnouncements(prev => [newAnn, ...prev]);
      setShowCreate(false);
      resetForm();
      toast('Draft saved successfully');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to save draft', true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
      toast('Announcement deleted');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete announcement', true);
    }
  };

  const handleEditSave = async () => {
    if (!editAnn) return;
    try {
      const updated = await updateAnnouncement(editAnn);
      setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditAnn(null);
      toast('Announcement updated successfully');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to update announcement', true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-800' },
          { label: 'Published', value: counts.published, color: 'text-emerald-600' },
          { label: 'Drafts', value: counts.drafts, color: 'text-slate-500' },
          { label: 'Scheduled', value: counts.scheduled, color: 'text-blue-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Header + Create button */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">All Announcements</h2>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          <Plus size={15} /> Create Announcement
        </button>
      </div>

      {/* Announcement cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <AnnBadge status={a.status} />
                <h3 className="font-semibold text-slate-800 text-sm mt-2 leading-snug">{a.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400">Audience: {a.audience}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{a.date}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{a.description}</p>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
              <button onClick={() => setViewAnn(a)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Eye size={12} /> View
              </button>
              <button onClick={() => setEditAnn({ ...a })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => setDeleteConfirm(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400">No announcements yet</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create Announcement" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <Field label="Title *">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Audience">
                <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className={inp}>
                  <option>All Staff</option>
                  <option>Volunteers</option>
                  <option>Coordinators</option>
                  <option>Partners</option>
                  <option>All</option>
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inp} />
              </Field>
            </div>
            <Field label="Message *">
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Announcement content..." className={`${inp} resize-none`} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={handleDraft} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Save Draft</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handlePublish} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Publish</button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewAnn && (
        <Modal title="Announcement Details" onClose={() => setViewAnn(null)}>
          <div className="space-y-3">
            <div className="mb-4"><AnnBadge status={viewAnn.status} /></div>
            {([['Title', viewAnn.title], ['Audience', viewAnn.audience], ['Date', viewAnn.date], ['Description', viewAnn.description]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex gap-4">
                <span className="text-slate-500 w-24 flex-shrink-0 text-xs pt-0.5">{l}</span>
                <span className="text-slate-800 font-medium text-xs leading-relaxed">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setViewAnn(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">Close</button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editAnn && (
        <Modal title="Edit Announcement" onClose={() => setEditAnn(null)}>
          <div className="space-y-4">
            <Field label="Title">
              <input value={editAnn.title} onChange={e => setEditAnn({ ...editAnn, title: e.target.value })} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Audience">
                <select value={editAnn.audience} onChange={e => setEditAnn({ ...editAnn, audience: e.target.value })} className={inp}>
                  <option>All Staff</option>
                  <option>Volunteers</option>
                  <option>Coordinators</option>
                  <option>Partners</option>
                  <option>All</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={editAnn.status} onChange={e => setEditAnn({ ...editAnn, status: e.target.value as Announcement['status'] })} className={inp}>
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Scheduled</option>
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea value={editAnn.description} onChange={e => setEditAnn({ ...editAnn, description: e.target.value })} rows={4} className={`${inp} resize-none`} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setEditAnn(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p className="text-sm text-slate-600">Are you sure you want to delete this announcement? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700">Delete</button>
          </div>
        </Modal>
      )}
    </div>
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
