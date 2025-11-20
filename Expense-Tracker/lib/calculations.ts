import type { Expense } from "@/types/database.types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format, parseISO } from "date-fns";

export function calculateTodayTotal(expenses: Expense[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
}

export function calculateWeekTotal(expenses: Expense[], startOfWeekDay: number = 1): number {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: startOfWeekDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const weekEnd = endOfWeek(now, { weekStartsOn: startOfWeekDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

  return expenses
    .filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
}

export function calculateMonthTotal(expenses: Expense[]): number {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return expenses
    .filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
}

export function getCategoryBreakdown(expenses: Expense[]): { category: string; amount: number; percentage: number }[] {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getPaymentModeBreakdown(expenses: Expense[]): { mode: string; amount: number; percentage: number }[] {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const modeTotals = expenses.reduce((acc, expense) => {
    acc[expense.payment_mode] = (acc[expense.payment_mode] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(modeTotals)
    .map(([mode, amount]) => ({
      mode,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getDailyTotals(expenses: Expense[], startOfWeekDay: number = 1): { date: string; amount: number }[] {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: startOfWeekDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const weekEnd = endOfWeek(now, { weekStartsOn: startOfWeekDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

  const dailyTotals: Record<string, number> = {};
  const currentDate = new Date(weekStart);

  // Initialize all days in the week with 0
  while (currentDate <= weekEnd) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    dailyTotals[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add actual expenses
  expenses.forEach((expense) => {
    const expenseDate = parseISO(expense.date);
    if (isWithinInterval(expenseDate, { start: weekStart, end: weekEnd })) {
      const dateStr = format(expenseDate, "yyyy-MM-dd");
      dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + Number(expense.amount);
    }
  });

  return Object.entries(dailyTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function formatCurrency(amount: number, currency: string = "₹"): string {
  return `${currency}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: "🍔",
    transport: "🚗",
    groceries: "🛒",
    bills: "📄",
    personal: "👤",
    others: "📦",
  };
  return icons[category] || "📦";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: "bg-orange-100 text-orange-800",
    transport: "bg-blue-100 text-blue-800",
    groceries: "bg-green-100 text-green-800",
    bills: "bg-purple-100 text-purple-800",
    personal: "bg-pink-100 text-pink-800",
    others: "bg-gray-100 text-gray-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
}

export function getPaymentModeIcon(mode: string): string {
  const icons: Record<string, string> = {
    cash: "💵",
    upi: "📱",
    card: "💳",
  };
  return icons[mode] || "💳";
}
