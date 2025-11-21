import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBills } from "@/actions/bills";
import { getUserSettings } from "@/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon, formatCurrency } from "@/lib/calculations";
import { PayBillForm } from "./PayBillForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PayBillPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bills, settings] = await Promise.all([
    getBills(),
    getUserSettings(),
  ]);

  const bill = bills.find((b) => b.id === id);

  if (!bill) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/bills">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bills
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pay Bill</h1>
          <p className="text-gray-600 mt-2">
            Record payment for this bill
          </p>
        </div>

        {/* Bill Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {bill.category && (
                <div className="text-3xl">
                  {getCategoryIcon(bill.category)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{bill.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {bill.category && (
                    <Badge variant="secondary">
                      {bill.category}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">
                    Due: {bill.due_date}{getDaySuffix(bill.due_date)} of every month
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(bill.amount), settings.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Select payment mode and date when this bill was paid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayBillForm bill={bill} currency={settings.currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
