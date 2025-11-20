import { getBills, getBillsPaid, getBillStatus } from "@/actions/bills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/calculations";
import { getUserSettings } from "@/actions/settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const bills = await getBills();
  const settings = await getUserSettings();

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const billsPaid = await getBillsPaid(currentMonth);

  // Get bill statuses
  const billsWithStatus = await Promise.all(
    bills.map(async (bill) => {
      const status = await getBillStatus(bill, currentMonth);
      const isPaid = billsPaid.some((bp) => bp.bill_id === bill.id);
      return { ...bill, status, isPaid };
    })
  );

  const totalBills = bills.length;
  const paidCount = billsWithStatus.filter((b) => b.status === "paid").length;
  const pendingCount = billsWithStatus.filter((b) => b.status === "pending").length;
  const overdueCount = billsWithStatus.filter((b) => b.status === "overdue").length;

  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const paidAmount = billsWithStatus
    .filter((b) => b.status === "paid")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills Manager</h1>
          <p className="text-gray-600 mt-1">Manage your recurring bills and payments</p>
        </div>
        <Link
          href="/bills/add"
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          + Add Bill
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totalBills}</p>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(totalAmount, settings.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-success">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{paidCount}</p>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(paidAmount, settings.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-warning">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-danger">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-danger">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {billsWithStatus.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bills configured. Add your first bill to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billsWithStatus.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        bill.status === "paid"
                          ? "bg-green-100"
                          : bill.status === "overdue"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      {bill.status === "paid" ? "✓" : bill.status === "overdue" ? "🚫" : "⚠️"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">Due: {bill.due_date}th of month</span>
                        {bill.category && (
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                            {bill.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(Number(bill.amount), settings.currency)}
                      </p>
                      <Badge
                        variant={
                          bill.status === "paid"
                            ? "success"
                            : bill.status === "overdue"
                            ? "danger"
                            : "warning"
                        }
                        className="mt-1"
                      >
                        {bill.status.toUpperCase()}
                      </Badge>
                    </div>

                    {bill.status !== "paid" && (
                      <Link
                        href={`/bills/pay/${bill.id}`}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Mark as Paid
                      </Link>
                    )}
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
