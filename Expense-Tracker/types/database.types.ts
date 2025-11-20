// Database types for Supabase tables

export type Category = 'food' | 'transport' | 'groceries' | 'bills' | 'personal' | 'others';
export type PaymentMode = 'cash' | 'upi' | 'card';

export interface UserSettings {
  id: string;
  user_id: string;
  monthly_budget: number;
  currency: string;
  start_of_week: number;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  item: string;
  amount: number;
  category: Category;
  payment_mode: PaymentMode;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillPaid {
  id: string;
  user_id: string;
  bill_id?: string;
  bill_name: string;
  amount: number;
  payment_mode: string;
  paid_date: string;
  month_year: string;
  created_at: string;
}

export interface ExpenseFormData {
  item: string;
  amount: number;
  category: Category;
  payment_mode: PaymentMode;
  date: Date;
  notes?: string;
}

export interface BillFormData {
  name: string;
  amount: number;
  due_date: number;
  category?: string;
  is_active: boolean;
}
