const API_BASE = '/api/analytics';

// ============ ANALYTICS API ============

export interface AnalyticsOverview {
  students: {
    total: number;
    active: number;
    completed: number;
  };
  staff: {
    total: number;
    active: number;
  };
  clients: {
    total: number;
    active: number;
    bySource: {
      direct: number;
      insurance: number;
      corporate: number;
    };
  };
  vehicles: {
    total: number;
    inService: number;
  };
  jobs: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    inventoryValue: number;
  };
  inventory: {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
  };
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export interface RevenueAnalytics {
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  revenueByType: Array<{
    type: string;
    revenue: number;
  }>;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  const res = await fetch(`${API_BASE}/revenue`);
  if (!res.ok) throw new Error('Failed to fetch revenue analytics');
  return res.json();
}

export interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockByCategory: Array<{
    category: string;
    itemCount: number;
    value: number;
  }>;
  topUsedParts: Array<{
    name: string;
    sku: string;
    quantity: number;
    profit: number;
  }>;
  recentTransactions: any[];
  turnoverRate: {
    period: string;
    partsUsed: number;
    revenue: number;
  };
}

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  const res = await fetch(`${API_BASE}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory analytics');
  return res.json();
}

export interface StaffAnalytics {
  totalStaff: number;
  activeStaff: number;
  staffPerformance: Array<{
    staffId: string;
    staffName: string;
    totalJobs: number;
    completedJobs: number;
    completionRate: string;
  }>;
  totalStudents: number;
  activeStudents: number;
}

export async function getStaffAnalytics(): Promise<StaffAnalytics> {
  const res = await fetch(`${API_BASE}/staff`);
  if (!res.ok) throw new Error('Failed to fetch staff analytics');
  return res.json();
}

export interface JobAnalytics {
  totalJobs: number;
  jobsByStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  jobsByType: Array<{
    type: string;
    count: number;
  }>;
  avgCompletionTimeDays: number;
  completedJobs: number;
}

export async function getJobAnalytics(): Promise<JobAnalytics> {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch job analytics');
  return res.json();
}
