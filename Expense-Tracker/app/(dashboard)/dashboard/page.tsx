import { getExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateTodayTotal,
  calculateWeekTotal,
  calculateMonthTotal,
  getCategoryBreakdown,
  formatCurrency,
  getCategoryIcon,
  getCategoryColor,
  getPaymentModeIcon
} from "@/lib/calculations";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const expenses = await getExpenses();
  const settings = await getUserSettings();

  const todayTotal = calculateTodayTotal(expenses);
  const todayCount = expenses.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expenseDate = new Date(e.date);
    expenseDate.setHours(0, 0, 0, 0);
    return expenseDate.getTime() === today.getTime();
  }).length;

  const weekTotal = calculateWeekTotal(expenses, settings.start_of_week);
  const monthTotal = calculateMonthTotal(expenses);
  const budget = Number(settings.monthly_budget);
  const remaining = budget - monthTotal;
  const budgetPercentage = budget > 0 ? (monthTotal / budget) * 100 : 0;

  const monthCategoryBreakdown = getCategoryBreakdown(
    expenses.filter((e) => {
      const now = new Date();
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
  ).slice(0, 3);

  const recentExpenses = expenses.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your expense overview.</p>
        </div>
        <Link
          href="/dashboard/add-expense"
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          + Add Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(todayTotal, settings.currency)}
              </p>
              <p className="text-sm text-gray-600">{todayCount} transactions</p>
            </div>
          </CardContent>
        </Card>

        {/* This Week Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(weekTotal, settings.currency)}
              </p>
              <p className="text-sm text-gray-600">
                Daily avg: {formatCurrency(weekTotal / 7, settings.currency)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(monthTotal, settings.currency)}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">{formatCurrency(budget, settings.currency)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budgetPercentage > 100 ? "bg-danger" : budgetPercentage > 80 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className={`text-sm font-medium ${remaining >= 0 ? "text-success" : "text-danger"}`}>
                  {remaining >= 0 ? "Remaining" : "Overspent"}: {formatCurrency(Math.abs(remaining), settings.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown for This Month */}
      {monthCategoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthCategoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(cat.category)}</span>
                      <span className="font-medium capitalize">{cat.category}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(cat.amount, settings.currency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{cat.percentage.toFixed(1)}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Link href="/dashboard/transactions" className="text-sm text-primary hover:text-blue-600">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No expenses yet. Start by adding your first expense!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{expense.item}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getPaymentModeIcon(expense.payment_mode)} {expense.payment_mode.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(Number(expense.amount), settings.currency)}
                    </p>
                    <p className="text-xs text-gray-500">{format(new Date(expense.date), "MMM d, h:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
