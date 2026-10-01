import type React from 'react';

export type Page =
  | 'resource-dashboard' | 'budget-management' | 'resources' | 'expenses'
  | 'comm-dashboard' | 'messages' | 'announcements' | 'contacts'
  | 'admin-dashboard' | 'user-management' | 'roles-access' | 'settings';

export interface Budget {
  id: number;
  project: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  financialYear: string;
  description: string;
  status: 'On Track' | 'At Risk' | 'Over Budget';
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  quantity: number;
  project: string;
  responsiblePerson: string;
  status: 'Available' | 'Assigned' | 'Maintenance';
}

export interface Expense {
  id: number;
  date: string;
  project: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface DashboardData {
  financialYear: string;
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilisationPercent: number;
  monthlyLabel: string;
  monthlyExpenses: { month: string; amount: number }[];
  projectBudgets: { id: number; project: string; allocated: number; spent: number; remaining: number; percent: number; status: Budget['status'] }[];
  resourceSummary: { total: number; available: number; assigned: number; maintenance: number };
  recentActivity: { type: 'expense' | 'budget' | 'resource'; label: string; amount: number; date: string }[];
}

export interface Message {
  id: string;
  sender: string;
  initials: string;
  recipient: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archived';
}

export interface Announcement {
  id: string;
  title: string;
  audience: string;
  date: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  description: string;
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  category: 'Staff' | 'Volunteer' | 'Coordinator' | 'Donor' | 'Partner' | 'External';
  email: string;
  phone: string;
  organization: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: 'Administrator' | 'Staff' | 'Coordinator' | 'Volunteer';
  status: 'Active' | 'Pending' | 'Inactive';
  lastActive: string;
}

export interface AppNotification {
  id: string;
  icon: string;
  text: string;
  page: Page;
  read: boolean;
  time: string;
}

export interface NavOpts {
  userFilter?: string;
  recipient?: string;
  folder?: string;
}

export interface PageProps {
  navigate: (page: Page, opts?: NavOpts) => void;
  toast: (msg: string, isError?: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  contacts: Contact[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  navOpts: NavOpts;
}
