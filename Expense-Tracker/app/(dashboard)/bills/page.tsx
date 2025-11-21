import { getBills, getBillsPaid, getBillStatus } from "@/actions/bills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { getUserSettings } from "@/actions/settings";
import { BillCard } from "@/components/bills/BillCard";
import { BillsClient } from "./BillsClient";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      return { ...bill, status };
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
        <Link href="/bills/add" className="hidden md:block">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
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
            <CardTitle className="text-lg font-semibold text-green-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{paidCount}</p>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(paidAmount, settings.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(totalAmount - paidAmount, settings.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
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
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bills configured
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first recurring bill to get started tracking your monthly expenses
              </p>
              <Link href="/bills/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Bill
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {billsWithStatus.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  currency={settings.currency}
                  status={bill.status}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client-side components (FAB and Modal) */}
      <BillsClient currency={settings.currency} />
    </div>
  );
}
