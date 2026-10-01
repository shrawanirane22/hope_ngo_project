import { useState } from 'react';
import type { PageProps, Contact } from '../types';
import { X, MessageSquare, Phone, Mail, Building } from 'lucide-react';

const CATEGORIES = ['All', 'Staff', 'Volunteer', 'Coordinator', 'Donor', 'Partner', 'External'] as const;

export default function Contacts({ contacts, navigate, toast }: PageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.organization.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleSendMessage = (contact: Contact) => {
    setViewContact(null);
    navigate('messages', { recipient: contact.name });
  };

  return (
    <div className="space-y-5">
      {/* Category tabs + Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({contacts.filter(c => c.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts by name, email, or organization..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} contact{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => setViewContact(c)}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <span className="text-white font-bold text-sm">{c.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{c.name}</p>
                <CatBadge category={c.category} />
                <p className="text-xs text-slate-400 mt-1 truncate">{c.organization}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail size={11} className="flex-shrink-0" />
                <span className="text-xs truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={11} className="flex-shrink-0" />
                <span className="text-xs">{c.phone}</span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-12 text-slate-400">No contacts found</div>
        )}
      </div>

      {/* Contact detail modal */}
      {viewContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setViewContact(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Contact Details</h3>
              <button onClick={() => setViewContact(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl ${viewContact.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">{viewContact.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{viewContact.name}</p>
                  <CatBadge category={viewContact.category} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Building size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm">{viewContact.organization}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm">{viewContact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm">{viewContact.phone}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleSendMessage(viewContact)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium"
                >
                  <MessageSquare size={15} /> Send Message
                </button>
                <button onClick={() => setViewContact(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CatBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    Staff: 'bg-blue-100 text-blue-700',
    Volunteer: 'bg-emerald-100 text-emerald-700',
    Coordinator: 'bg-violet-100 text-violet-700',
    Donor: 'bg-amber-100 text-amber-700',
    Partner: 'bg-cyan-100 text-cyan-700',
    External: 'bg-slate-100 text-slate-600',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${map[category] || 'bg-slate-100 text-slate-600'}`}>{category}</span>;
}
