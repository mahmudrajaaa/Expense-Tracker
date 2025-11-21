import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/actions/settings";
import { createExpense } from "@/actions/expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExpenseForm } from "./AddExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
          <p className="text-gray-600 mt-2">
            Record a new expense to track your spending
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
            <CardDescription>
              Fill in the information below to add a new expense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddExpenseForm currency={settings.currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
