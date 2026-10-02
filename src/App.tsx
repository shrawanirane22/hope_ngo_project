import { useEffect, useState } from 'react';
import type { Page, PageProps, NavOpts, AppNotification } from './types';
import { initialUsers, initialNotifications } from './data';
import { LayoutDashboard, Wallet, Package, Receipt, MessageSquare, Megaphone, Users, Shield, Settings, Bell, ChevronDown, X, CheckCircle, AlertCircle, LogOut, User, Menu } from 'lucide-react';
import ResourceDashboard from './pages/ResourceDashboard';
import BudgetManagement from './pages/BudgetManagement';
import Resources from './pages/Resources';
import Expenses from './pages/Expenses';
import CommDashboard from './pages/CommDashboard';
import Messages from './pages/Messages';
import Announcements from './pages/Announcements';
import Contacts from './pages/Contacts';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import RolesAccess from './pages/RolesAccess';
import SettingsPage from './pages/Settings';
import { getAnnouncements, getContacts, getMessages } from './api';

const sidebarSections = [
  {
    label: 'RESOURCE & BUDGET',
    items: [
      { id: 'resource-dashboard' as Page, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'budget-management' as Page, label: 'Budget Management', icon: <Wallet size={16} /> },
      { id: 'resources' as Page, label: 'Resources', icon: <Package size={16} /> },
      { id: 'expenses' as Page, label: 'Expenses', icon: <Receipt size={16} /> },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { id: 'comm-dashboard' as Page, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'messages' as Page, label: 'Messages', icon: <MessageSquare size={16} /> },
      { id: 'announcements' as Page, label: 'Announcements', icon: <Megaphone size={16} /> },
      { id: 'contacts' as Page, label: 'Contacts', icon: <Users size={16} /> },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { id: 'admin-dashboard' as Page, label: 'Admin Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'user-management' as Page, label: 'User Management', icon: <Users size={16} /> },
      { id: 'roles-access' as Page, label: 'Roles & Access', icon: <Shield size={16} /> },
      { id: 'settings' as Page, label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
];

const pageTitles: Record<Page, string> = {
  'resource-dashboard': 'Resource & Budget Dashboard',
  'budget-management': 'Budget Management',
  'resources': 'Resources',
  'expenses': 'Expenses',
  'comm-dashboard': 'Communication Dashboard',
  'messages': 'Messages',
  'announcements': 'Announcements',
  'contacts': 'Contacts',
  'admin-dashboard': 'Admin Dashboard',
  'user-management': 'User Management',
  'roles-access': 'Roles & Access',
  'settings': 'Settings',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('resource-dashboard');
  const [navOpts, setNavOpts] = useState<NavOpts>({});
  const [toasts, setToasts] = useState<{ id: string; msg: string; isError: boolean }[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [messages, setMessages] = useState<import('./types').Message[]>([]);
  const [announcements, setAnnouncements] = useState<import('./types').Announcement[]>([]);
  const [contacts, setContacts] = useState<import('./types').Contact[]>([]);

  useEffect(() => {
    Promise.all([getMessages(), getAnnouncements(), getContacts()])
      .then(([loadedMessages, loadedAnnouncements, loadedContacts]) => {
        setMessages(loadedMessages);
        setAnnouncements(loadedAnnouncements);
        setContacts(loadedContacts);
      })
      .catch(error => toast(error instanceof Error ? error.message : 'Failed to load Communication data', true));
  }, []);
  const [users, setUsers] = useState(initialUsers);

  const navigate = (page: Page, opts: NavOpts = {}) => {
    setCurrentPage(page);
    setNavOpts(opts);
    setShowNotif(false);
    setShowProfile(false);
  };

  const toast = (msg: string, isError = false) => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, msg, isError }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    if (isError) return; // errors are only shown as a toast, not saved as a notification
    const newNotif: AppNotification = {
      id: `N${Date.now()}`,
      icon: '✅',
      text: msg,
      page: currentPage,
      read: false,
      time: 'Just now',
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const pageProps: PageProps = {
    navigate,
    toast,
    messages,
    setMessages,
    announcements,
    setAnnouncements,
    contacts,
    users,
    setUsers,
    navOpts,
  };

  const handleLogout = () => {
    setShowProfile(false);
    toast('Logged out successfully');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100" onClick={() => { setShowNotif(false); setShowProfile(false); }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-200 bg-slate-900 flex flex-col flex-shrink-0`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">HOPE Foundation</p>
              <p className="text-slate-400 text-xs">NGO Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {sidebarSections.map(section => (
            <div key={section.label} className="mb-5">
              <p className="text-slate-500 text-[10px] font-semibold tracking-wider px-2 mb-2">{section.label}</p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user info */}
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">RS</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">Rajesh Sharma</p>
              <p className="text-slate-400 text-[10px]">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setSidebarOpen(o => !o); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-slate-800 font-semibold text-sm leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {pageTitles[currentPage]}
            </h1>
            <p className="text-slate-400 text-xs">NGO Project Management System</p>
          </div>

          {/* Notifications */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowNotif(o => !o); setShowProfile(false); }}
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.slice(0, 8).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                        navigate(n.page);
                        setShowNotif(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-3 items-start border-b border-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowProfile(o => !o); setShowNotif(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">RS</span>
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <button
                  onClick={() => { setShowProfile(false); toast('Profile page coming soon'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => { navigate('settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings size={15} /> Settings
                </button>
                <div className="border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {currentPage === 'resource-dashboard' && <ResourceDashboard {...pageProps} />}
          {currentPage === 'budget-management' && <BudgetManagement {...pageProps} />}
          {currentPage === 'resources' && <Resources {...pageProps} />}
          {currentPage === 'expenses' && <Expenses {...pageProps} />}
          {currentPage === 'comm-dashboard' && <CommDashboard {...pageProps} />}
          {currentPage === 'messages' && <Messages {...pageProps} />}
          {currentPage === 'announcements' && <Announcements {...pageProps} />}
          {currentPage === 'contacts' && <Contacts {...pageProps} />}
          {currentPage === 'admin-dashboard' && <AdminDashboard {...pageProps} />}
          {currentPage === 'user-management' && <UserManagement {...pageProps} />}
          {currentPage === 'roles-access' && <RolesAccess {...pageProps} />}
          {currentPage === 'settings' && <SettingsPage {...pageProps} />}
        </main>
      </div>

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-auto animate-in">
            {t.isError
              ? <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
              : <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
            <span>{t.msg}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-1 text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
