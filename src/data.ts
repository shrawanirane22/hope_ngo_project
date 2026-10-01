import type { Message, Announcement, Contact, User, AppNotification } from './types';

export const initialMessages: Message[] = [
  { id: 'M001', sender: 'Meera Nair', initials: 'MN', recipient: 'Admin', subject: 'Budget Approval Request – Q3 Field Expenses', preview: 'Requesting approval for Q3 field expenses totalling ₹42,000...', body: 'Dear Admin,\n\nI am writing to request approval for Q3 field expenses totalling ₹42,000 for the Rural Education Initiative. This includes travel costs of ₹15,000, accommodation ₹12,000, and materials ₹15,000.\n\nPlease review and approve at the earliest.\n\nRegards,\nMeera Nair', time: '10:30 AM', read: false, folder: 'inbox' },
  { id: 'M002', sender: 'Arjun Singh', initials: 'AS', recipient: 'Admin', subject: 'Healthcare Camp – Field Report February 2025', preview: 'Successfully attended 847 patients during the healthcare camp...', body: 'Dear Admin,\n\nI am pleased to report that the Healthcare Outreach Camp held at Pune district on 1-2 February 2025 was a success. We attended 847 patients, conducted 120 diagnostics, and distributed medicines worth ₹18,000.\n\nAttaching the detailed report for your records.\n\nRegards,\nArjun Singh', time: '9:15 AM', read: false, folder: 'inbox' },
  { id: 'M003', sender: 'Kavita Rao', initials: 'KR', recipient: 'Admin', subject: 'Training Schedule Update – Women Empowerment', preview: 'The women empowerment training batch has been rescheduled...', body: 'Hi,\n\nThis is to inform you that the Women Empowerment training batch originally scheduled for 10 Feb has been rescheduled to 17 Feb due to venue unavailability. All participants have been notified.\n\nPlease update the project calendar accordingly.\n\nThanks,\nKavita Rao', time: 'Yesterday', read: true, folder: 'inbox' },
  { id: 'M004', sender: 'Vikram Gupta', initials: 'VG', recipient: 'Admin', subject: 'Equipment Delivery Confirmation – Digital Literacy', preview: 'The 12 computers and 8 tablets have been delivered and verified...', body: 'Hello,\n\nConfirming receipt of the equipment order for Digital Literacy Drive:\n- 12 Laptops (Dell Inspiron)\n- 8 Tablets (Samsung Galaxy)\n- Accessories and peripherals\n\nAll items have been verified and inventoried. Setup will begin next week.\n\nViikram Gupta', time: '2 days ago', read: true, folder: 'inbox' },
  { id: 'M005', sender: 'NITI Aayog', initials: 'NA', recipient: 'Admin', subject: 'NGO Registration Renewal – Action Required', preview: 'Your annual NGO registration renewal is due by 31 March 2025...', body: 'Dear Samridhi Foundation,\n\nThis is a reminder that your annual NGO registration renewal under the Foreign Contribution Regulation Act is due by 31 March 2025.\n\nPlease submit the required documents at your earliest convenience to avoid any disruption to your operations.\n\nRegards,\nNITI Aayog', time: '3 days ago', read: true, folder: 'inbox' },
  { id: 'M006', sender: 'Rajesh Sharma', initials: 'RS', recipient: 'Meera Nair', subject: 'Re: Budget Approval – Approved', preview: 'Approved. Please proceed with the field activities.', body: 'Hi Meera,\n\nYour budget request of ₹42,000 for Q3 field expenses has been approved. Please proceed with the field activities and submit receipts within 7 days of expenditure.\n\nBest,\nRajesh Sharma', time: '11:00 AM', read: true, folder: 'sent' },
  { id: 'M007', sender: 'Admin', initials: 'AD', recipient: 'All Staff', subject: 'Draft: Monthly Newsletter', preview: 'Draft newsletter for February 2025...', body: 'Draft content for February 2025 newsletter. Work in progress.', time: '1 day ago', read: true, folder: 'drafts' },
];

export const initialAnnouncements: Announcement[] = [
  { id: 'AN001', title: 'Annual NGO Review Meeting 2025', audience: 'All Staff', date: '25 Jan 2025', status: 'Published', description: 'The annual review meeting will be held at the Samridhi Foundation headquarters. All staff must attend. Agenda includes project progress review, budget discussions, and planning for FY 2025-26.' },
  { id: 'AN002', title: 'Community Health Camp – Pune District', audience: 'Volunteers', date: '10 Feb 2025', status: 'Published', description: 'A free healthcare camp will be organized in Pune district. Volunteers are requested to register and report by 8:00 AM. Medical kits and refreshments will be provided.' },
  { id: 'AN003', title: 'Digital Literacy Workshop – March Batch', audience: 'Partners', date: '15 Mar 2025', status: 'Scheduled', description: 'The next batch of Digital Literacy workshops is scheduled for March. Partner organizations are invited to nominate candidates. Maximum 30 participants per batch.' },
  { id: 'AN004', title: 'Year-End Financial Report Submission', audience: 'Staff', date: '31 Mar 2025', status: 'Draft', description: 'All department heads must submit their year-end financial reports and project summaries by 31 March 2025 for audit compliance.' },
];

export const initialContacts: Contact[] = [
  { id: 'C001', name: 'Meera Nair', initials: 'MN', category: 'Staff', email: 'meera.nair@samridhi.org', phone: '+91 98765 43210', organization: 'Samridhi Foundation', color: 'bg-violet-500' },
  { id: 'C002', name: 'Arjun Singh', initials: 'AS', category: 'Staff', email: 'arjun.singh@samridhi.org', phone: '+91 98765 43211', organization: 'Samridhi Foundation', color: 'bg-blue-500' },
  { id: 'C003', name: 'Kavita Rao', initials: 'KR', category: 'Staff', email: 'kavita.rao@samridhi.org', phone: '+91 98765 43212', organization: 'Samridhi Foundation', color: 'bg-rose-500' },
  { id: 'C004', name: 'Samuel Thomas', initials: 'ST', category: 'Staff', email: 'samuel.thomas@samridhi.org', phone: '+91 98765 43213', organization: 'Samridhi Foundation', color: 'bg-emerald-500' },
  { id: 'C005', name: 'Amit Chaudhary', initials: 'AC', category: 'Staff', email: 'amit.chaudhary@samridhi.org', phone: '+91 98765 43214', organization: 'Samridhi Foundation', color: 'bg-amber-500' },
  { id: 'C006', name: 'Anil Kumar Verma', initials: 'AV', category: 'Volunteer', email: 'anil.verma@gmail.com', phone: '+91 90000 11111', organization: 'Individual', color: 'bg-teal-500' },
  { id: 'C007', name: 'Deepika Sharma', initials: 'DS', category: 'Volunteer', email: 'deepika.sharma@gmail.com', phone: '+91 90000 22222', organization: 'Individual', color: 'bg-pink-500' },
  { id: 'C008', name: 'Lakshmi Venkatesh', initials: 'LV', category: 'Volunteer', email: 'lakshmi.v@gmail.com', phone: '+91 90000 33333', organization: 'Individual', color: 'bg-orange-500' },
  { id: 'C009', name: 'Vikram Gupta', initials: 'VG', category: 'Coordinator', email: 'vikram.gupta@samridhi.org', phone: '+91 98765 43215', organization: 'Samridhi Foundation', color: 'bg-indigo-500' },
  { id: 'C010', name: 'Sunita Mehta', initials: 'SM', category: 'Coordinator', email: 'sunita.mehta@samridhi.org', phone: '+91 98765 43216', organization: 'Samridhi Foundation', color: 'bg-cyan-500' },
  { id: 'C011', name: 'Ratan Tata Foundation', initials: 'RT', category: 'Donor', email: 'grants@tatafoundation.org', phone: '+91 22 6665 8282', organization: 'Tata Trusts', color: 'bg-blue-700' },
  { id: 'C012', name: 'Azim Premji Foundation', initials: 'AP', category: 'Donor', email: 'info@azimpremjifoundation.org', phone: '+91 80 6676 9000', organization: 'Azim Premji Foundation', color: 'bg-green-700' },
  { id: 'C013', name: 'UNICEF India', initials: 'UN', category: 'Partner', email: 'india@unicef.org', phone: '+91 11 2461 0062', organization: 'UNICEF', color: 'bg-sky-600' },
  { id: 'C014', name: 'Teach For India', initials: 'TF', category: 'Partner', email: 'info@teachforindia.org', phone: '+91 22 6152 0000', organization: 'Teach For India', color: 'bg-red-600' },
  { id: 'C015', name: 'Ministry of Health', initials: 'MH', category: 'External', email: 'contact@mohfw.gov.in', phone: '+91 11 2306 3232', organization: 'Govt. of India', color: 'bg-slate-600' },
];

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
