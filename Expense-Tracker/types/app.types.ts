// Application-specific types

export interface DashboardSummary {
  today: {
    total: number;
    count: number;
    categoryBreakdown: { category: string; amount: number }[];
  };
  week: {
    total: number;
    dailyAverage: number;
    dailyTotals: { date: string; amount: number }[];
  };
  month: {
    total: number;
    budget: number;
    remaining: number;
    percentage: number;
    topCategories: { category: string; amount: number; percentage: number }[];
  };
}

export interface MonthlyReport {
  month: string;
  totalExpenses: number;
  budget: number;
  saved: number;
  savedPercentage: number;
  transactionCount: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  paymentModeBreakdown: { mode: string; amount: number; percentage: number }[];
}

export interface BillStatus {
  bill: {
    id: string;
    name: string;
    amount: number;
    due_date: number;
  };
  status: 'paid' | 'pending' | 'overdue';
  isPaid: boolean;
}
