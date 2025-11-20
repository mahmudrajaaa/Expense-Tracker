import { getMonthExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCategoryBreakdown,
  getPaymentModeBreakdown,
  formatCurrency,
  getCategoryIcon,
  getCategoryColor,
} from "@/lib/calculations";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const expenses = await getMonthExpenses(currentYear, currentMonth);
  const settings = await getUserSettings();

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budget = Number(settings.monthly_budget);
  const saved = budget - totalExpenses;
  const savedPercentage = budget > 0 ? (saved / budget) * 100 : 0;

  const categoryBreakdown = getCategoryBreakdown(expenses);
  const paymentModeBreakdown = getPaymentModeBreakdown(expenses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monthly Report</h1>
        <p className="text-gray-600 mt-1">
          {format(now, "MMMM yyyy")} - Detailed expense analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalExpenses, settings.currency)}
            </p>
            <p className="text-sm text-gray-600 mt-1">{expenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(budget, settings.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {saved >= 0 ? "Saved" : "Overspent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${saved >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(Math.abs(saved), settings.currency)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {savedPercentage.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalExpenses / 30, settings.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No expenses for this month</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(cat.category)}</span>
                      <div>
                        <p className="font-semibold capitalize">{cat.category}</p>
                        <p className="text-sm text-gray-600">{cat.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold">
                      {formatCurrency(cat.amount, settings.currency)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Mode Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment Mode Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentModeBreakdown.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No payment data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentModeBreakdown.map((mode) => (
                <div key={mode.mode} className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase font-semibold mb-2">
                    {mode.mode}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(mode.amount, settings.currency)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{mode.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalExpenses > budget && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-danger">Budget Exceeded</p>
                  <p className="text-sm text-gray-700 mt-1">
                    You've spent {formatCurrency(totalExpenses - budget, settings.currency)} more
                    than your budget this month. Consider reducing expenses in the top spending
                    categories.
                  </p>
                </div>
              </div>
            )}

            {categoryBreakdown.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-primary">Top Spending Category</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Your highest spending category is <strong>{categoryBreakdown[0].category}</strong> with{" "}
                    {formatCurrency(categoryBreakdown[0].amount, settings.currency)} (
                    {categoryBreakdown[0].percentage.toFixed(1)}% of total expenses).
                  </p>
                </div>
              </div>
            )}

            {saved > 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-success">Great Job!</p>
                  <p className="text-sm text-gray-700 mt-1">
                    You're within budget and have saved{" "}
                    {formatCurrency(saved, settings.currency)} this month. Keep up the good work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
