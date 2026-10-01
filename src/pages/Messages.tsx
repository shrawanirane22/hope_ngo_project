import { useState, useEffect } from 'react';
import type { PageProps, Message } from '../types';
import { Plus, X, Reply, Send, Inbox, SendHorizonal, FileText, Archive, Search, Paperclip } from 'lucide-react';

export default function Messages({ messages, setMessages, toast, navOpts }: PageProps) {
  const [folder, setFolder] = useState<Message['folder']>((navOpts.folder as Message['folder']) || 'inbox');
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: navOpts.recipient || '', subject: '', body: '', attachment: '' });

  useEffect(() => {
    if (navOpts.folder) setFolder(navOpts.folder as Message['folder']);
    if (navOpts.recipient) { setShowCompose(true); setCompose(prev => ({ ...prev, to: navOpts.recipient || '' })); }
  }, [navOpts.folder, navOpts.recipient]);

  const folderItems = [
    { id: 'inbox' as const, label: 'Inbox', icon: <Inbox size={15} />, count: messages.filter(m => m.folder === 'inbox' && !m.read).length },
    { id: 'sent' as const, label: 'Sent', icon: <SendHorizonal size={15} />, count: 0 },
    { id: 'drafts' as const, label: 'Drafts', icon: <FileText size={15} />, count: messages.filter(m => m.folder === 'drafts').length },
    { id: 'archived' as const, label: 'Archived', icon: <Archive size={15} />, count: 0 },
  ];

  const visibleMessages = messages.filter(m => {
    const matchFolder = m.folder === folder;
    const q = search.toLowerCase();
    const matchSearch = !q || m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
    return matchFolder && matchSearch;
  });

  const handleSelect = (m: Message) => {
    setSelected(m);
    setShowReply(false);
    setReplyText('');
    if (!m.read) setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x));
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    const reply: Message = {
      id: `M${Date.now()}`,
      sender: 'Admin',
      initials: 'AD',
      recipient: selected?.sender || '',
      subject: `Re: ${selected?.subject}`,
      preview: replyText.slice(0, 60),
      body: replyText,
      time: 'Just now',
      read: true,
      folder: 'sent',
    };
    setMessages(prev => [...prev, reply]);
    setShowReply(false);
    setReplyText('');
    toast('Message sent successfully');
  };

  const handleSend = () => {
    if (!compose.to || !compose.subject || !compose.body) return;
    const msg: Message = {
      id: `M${Date.now()}`,
      sender: 'Admin',
      initials: 'AD',
      recipient: compose.to,
      subject: compose.subject,
      preview: compose.body.slice(0, 60),
      body: compose.body,
      time: 'Just now',
      read: true,
      folder: 'sent',
    };
    setMessages(prev => [...prev, msg]);
    setShowCompose(false);
    setCompose({ to: '', subject: '', body: '', attachment: '' });
    toast('Message sent successfully');
  };

  const handleSaveDraft = () => {
    if (!compose.subject && !compose.body) return;
    const draft: Message = {
      id: `M${Date.now()}`,
      sender: 'Admin',
      initials: 'AD',
      recipient: compose.to,
      subject: compose.subject || '(No subject)',
      preview: compose.body.slice(0, 60),
      body: compose.body,
      time: 'Just now',
      read: true,
      folder: 'drafts',
    };
    setMessages(prev => [...prev, draft]);
    setShowCompose(false);
    setCompose({ to: '', subject: '', body: '', attachment: '' });
    toast('Draft saved');
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Left panel */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        {/* Folders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors mb-3"
          >
            <Plus size={15} /> New Message
          </button>
          {folderItems.map(f => (
            <button
              key={f.id}
              onClick={() => { setFolder(f.id); setSelected(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${folder === f.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {f.icon}
              <span className="flex-1 text-left">{f.label}</span>
              {f.count > 0 && <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{f.count}</span>}
            </button>
          ))}
        </div>

        {/* Message list */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {visibleMessages.length === 0 && (
              <p className="text-center text-slate-400 text-xs py-8">No messages</p>
            )}
            {visibleMessages.map(m => (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`w-full text-left px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.id === m.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-semibold">{m.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs truncate ${!m.read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>{m.sender}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{m.time}</span>
                    </div>
                    <p className={`text-[11px] truncate ${!m.read ? 'text-slate-700' : 'text-slate-500'}`}>{m.subject}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.preview}</p>
                  </div>
                  {!m.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Inbox size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Select a message to read</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold text-base">{selected.subject}</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{selected.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{selected.sender}</p>
                  <p className="text-xs text-slate-400">To: {selected.recipient || 'Admin'} · {selected.time}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.body}</p>
            </div>

            {showReply ? (
              <div className="border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-500 mb-2">Replying to {selected.sender}</p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type your reply..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setShowReply(false)} className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                  <button onClick={handleReply} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <Send size={13} /> Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 px-6 py-3">
                <button onClick={() => setShowReply(true)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                  <Reply size={14} /> Reply
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-end z-50 p-4" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">To *</label>
                <input value={compose.to} onChange={e => setCompose({ ...compose, to: e.target.value })} placeholder="Recipient name or email" className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Subject *</label>
                <input value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })} placeholder="Message subject" className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Message *</label>
                <textarea value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })} rows={5} placeholder="Type your message..." className={`${inp} resize-none`} />
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer hover:text-slate-600">
                <Paperclip size={14} /> Attach file
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={handleSaveDraft} className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Save Draft</button>
              <button onClick={() => setShowCompose(false)} className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSend} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Send size={13} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
