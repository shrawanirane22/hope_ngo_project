import type { Message, Announcement, Contact, User, AppNotification } from './types';


export const initialUsers: User[] = [
  { id: 'U001', name: 'Rajesh Kumar Sharma', initials: 'RS', email: 'rajesh.sharma@samridhi.org', role: 'Administrator', status: 'Active', lastActive: '2 hours ago' },
  { id: 'U002', name: 'Priya Vijayalakshmi Patel', initials: 'PP', email: 'priya.patel@samridhi.org', role: 'Administrator', status: 'Active', lastActive: '1 hour ago' },
  { id: 'U003', name: 'Ananya Krishnamurthy', initials: 'AK', email: 'ananya.k@samridhi.org', role: 'Administrator', status: 'Active', lastActive: '30 min ago' },
  { id: 'U004', name: 'Meera Nair', initials: 'MN', email: 'meera.nair@samridhi.org', role: 'Staff', status: 'Active', lastActive: '3 hours ago' },
  { id: 'U005', name: 'Arjun Singh', initials: 'AS', email: 'arjun.singh@samridhi.org', role: 'Staff', status: 'Active', lastActive: '1 day ago' },
  { id: 'U006', name: 'Kavita Rao', initials: 'KR', email: 'kavita.rao@samridhi.org', role: 'Staff', status: 'Active', lastActive: '5 hours ago' },
  { id: 'U007', name: 'Samuel Thomas', initials: 'ST', email: 'samuel.thomas@samridhi.org', role: 'Staff', status: 'Active', lastActive: '2 days ago' },
  { id: 'U008', name: 'Amit Chaudhary', initials: 'AC', email: 'amit.chaudhary@samridhi.org', role: 'Staff', status: 'Active', lastActive: '1 day ago' },
  { id: 'U009', name: 'Bhavna Shah', initials: 'BS', email: 'bhavna.shah@samridhi.org', role: 'Staff', status: 'Active', lastActive: '3 days ago' },
  { id: 'U010', name: 'Vikram Gupta', initials: 'VG', email: 'vikram.gupta@samridhi.org', role: 'Coordinator', status: 'Active', lastActive: '4 hours ago' },
  { id: 'U011', name: 'Sunita Mehta', initials: 'SM', email: 'sunita.mehta@samridhi.org', role: 'Coordinator', status: 'Active', lastActive: '6 hours ago' },
  { id: 'U012', name: 'Usha Reddy', initials: 'UR', email: 'usha.reddy@samridhi.org', role: 'Coordinator', status: 'Active', lastActive: '1 day ago' },
  { id: 'U013', name: 'Narendra Nair', initials: 'NN', email: 'narendra.nair@samridhi.org', role: 'Coordinator', status: 'Active', lastActive: '2 days ago' },
  { id: 'U014', name: 'Ravi Agarwal', initials: 'RA', email: 'ravi.agarwal@samridhi.org', role: 'Coordinator', status: 'Active', lastActive: '1 day ago' },
  { id: 'U015', name: 'Anil Kumar Verma', initials: 'AV', email: 'anil.verma@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '3 days ago' },
  { id: 'U016', name: 'Deepika Sharma', initials: 'DS', email: 'deepika.sharma@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '4 days ago' },
  { id: 'U017', name: 'Lakshmi Venkatesh', initials: 'LV', email: 'lakshmi.v@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '1 week ago' },
  { id: 'U018', name: 'Mohan Das Patel', initials: 'MP', email: 'mohan.patel@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '5 days ago' },
  { id: 'U019', name: 'Rekha Mishra', initials: 'RM', email: 'rekha.mishra@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '1 week ago' },
  { id: 'U020', name: 'Jagdish Tiwari', initials: 'JT', email: 'jagdish.tiwari@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '2 weeks ago' },
  { id: 'U021', name: 'Shalini Kumar', initials: 'SK', email: 'shalini.kumar@samridhi.org', role: 'Volunteer', status: 'Active', lastActive: '3 days ago' },
  { id: 'U022', name: 'Fatima Khan', initials: 'FK', email: 'fatima.khan@samridhi.org', role: 'Volunteer', status: 'Inactive', lastActive: '2 months ago' },
  { id: 'U023', name: 'Suresh Yadav', initials: 'SY', email: 'suresh.yadav@samridhi.org', role: 'Volunteer', status: 'Pending', lastActive: 'Never' },
  { id: 'U024', name: 'Pradeep Joshi', initials: 'PJ', email: 'pradeep.joshi@samridhi.org', role: 'Volunteer', status: 'Pending', lastActive: 'Never' },
];

export const initialNotifications: AppNotification[] = [
  { id: 'N001', icon: '💬', text: 'New message from Meera Nair: Budget Approval Request', page: 'messages', read: false, time: '10:30 AM' },
  { id: 'N002', icon: '📢', text: 'Announcement "Healthcare Camp" published', page: 'announcements', read: false, time: '9:00 AM' },
  { id: 'N003', icon: '💰', text: 'Healthcare Outreach budget is At Risk (73% utilised)', page: 'budget-management', read: false, time: 'Yesterday' },
  { id: 'N004', icon: '👤', text: '2 new users pending access approval', page: 'user-management', read: false, time: '2 days ago' },
];

export const commActivityData = [
  { day: 'Mon', messages: 12, announcements: 2 },
  { day: 'Tue', messages: 19, announcements: 1 },
  { day: 'Wed', messages: 8, announcements: 3 },
  { day: 'Thu', messages: 25, announcements: 1 },
  { day: 'Fri', messages: 16, announcements: 4 },
  { day: 'Sat', messages: 5, announcements: 0 },
  { day: 'Sun', messages: 3, announcements: 0 },
];

export const adminActivityData = [
  { month: 'Oct', logins: 18, actions: 42 },
  { month: 'Nov', logins: 22, actions: 58 },
  { month: 'Dec', logins: 15, actions: 35 },
  { month: 'Jan', logins: 24, actions: 67 },
  { month: 'Feb', logins: 21, actions: 54 },
  { month: 'Mar', logins: 19, actions: 48 },
];
