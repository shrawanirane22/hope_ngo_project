import type { Budget, Resource, Expense, DashboardData } from './types';

const API_URL = 'http://127.0.0.1:5000/api';

// Sends the request to Flask and returns the JSON.
// Throws an Error with a readable message if something goes wrong.
async function request(path: string, options: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Backend connection failed');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// ---------- Budgets ----------

export type BudgetInput = Pick<Budget, 'project' | 'category' | 'allocated' | 'financialYear' | 'description'> & {
  status?: Budget['status'];
};

// the database uses snake_case column names, the React code uses camelCase
const toBudget = (row: any): Budget => ({
  id: row.id,
  project: row.project,
  category: row.category,
  allocated: row.allocated,
  spent: row.spent,
  remaining: row.remaining,
  financialYear: row.financial_year,
  description: row.description || '',
  status: row.status,
});

const budgetBody = (b: BudgetInput) =>
  JSON.stringify({
    project: b.project,
    category: b.category,
    allocated: b.allocated,
    financial_year: b.financialYear,
    description: b.description,
    status: b.status,
  });

export async function getBudgets(): Promise<Budget[]> {
  const rows = await request('/budgets');
  return rows.map(toBudget);
}

export const createBudget = (b: BudgetInput) => request('/budgets', { method: 'POST', body: budgetBody(b) });
export const updateBudget = (id: number, b: BudgetInput) => request(`/budgets/${id}`, { method: 'PUT', body: budgetBody(b) });
export const deleteBudget = (id: number) => request(`/budgets/${id}`, { method: 'DELETE' });

// ---------- Resources ----------

export type ResourceInput = Omit<Resource, 'id'>;

const toResource = (row: any): Resource => ({
  id: row.id,
  name: row.name,
  category: row.category,
  quantity: row.quantity,
  project: row.project || '',
  responsiblePerson: row.responsible_person || '',
  status: row.status,
});

const resourceBody = (r: ResourceInput) =>
  JSON.stringify({
    name: r.name,
    category: r.category,
    quantity: r.quantity,
    project: r.project,
    responsible_person: r.responsiblePerson,
    status: r.status,
  });

export async function getResources(): Promise<Resource[]> {
  const rows = await request('/resources');
  return rows.map(toResource);
}

export const createResource = (r: ResourceInput) => request('/resources', { method: 'POST', body: resourceBody(r) });
export const updateResource = (id: number, r: ResourceInput) => request(`/resources/${id}`, { method: 'PUT', body: resourceBody(r) });
export const deleteResource = (id: number) => request(`/resources/${id}`, { method: 'DELETE' });

// ---------- Expenses ----------

export type ExpenseInput = Omit<Expense, 'id'>;

const toExpense = (row: any): Expense => ({
  id: row.id,
  date: row.date, // YYYY-MM-DD
  project: row.project,
  category: row.category,
  description: row.description || '',
  amount: row.amount,
  paymentMethod: row.payment_method || '',
  status: row.status,
});

const expenseBody = (e: ExpenseInput) =>
  JSON.stringify({
    date: e.date,
    project: e.project,
    category: e.category,
    description: e.description,
    amount: e.amount,
    payment_method: e.paymentMethod,
    status: e.status,
  });

export async function getExpenses(): Promise<Expense[]> {
  const rows = await request('/expenses');
  return rows.map(toExpense);
}

export const createExpense = (e: ExpenseInput) => request('/expenses', { method: 'POST', body: expenseBody(e) });
export const updateExpense = (id: number, e: ExpenseInput) => request(`/expenses/${id}`, { method: 'PUT', body: expenseBody(e) });
export const deleteExpense = (id: number) => request(`/expenses/${id}`, { method: 'DELETE' });

// ---------- Dashboard ----------

export async function getDashboard(): Promise<DashboardData> {
  const d = await request('/dashboard');
  return {
    financialYear: d.financial_year,
    totalBudget: d.total_budget,
    totalAllocated: d.total_allocated,
    totalSpent: d.total_spent,
    totalRemaining: d.total_remaining,
    utilisationPercent: d.utilisation_percent,
    monthlyLabel: d.monthly_label,
    monthlyExpenses: d.monthly_expenses,
    projectBudgets: d.project_budgets.map((p: any) => ({
      id: p.id,
      project: p.project,
      allocated: p.allocated,
      spent: p.spent,
      remaining: p.remaining,
      percent: p.percent,
      status: p.status,
    })),
    resourceSummary: {
      total: d.resource_summary.total,
      available: d.resource_summary.available,
      assigned: d.resource_summary.assigned,
      maintenance: d.resource_summary.maintenance,
    },
    recentActivity: d.recent_activity,
  };
}

// ---------- Display helpers ----------

// '2025-01-15' -> '15 Jan 2025'
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

// 1 -> 'EXP-001'
export const expenseCode = (id: number) => `EXP-${String(id).padStart(3, '0')}`;
