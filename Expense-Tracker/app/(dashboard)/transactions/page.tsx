import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { TransactionsList } from "./TransactionsList";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [expenses, settings] = await Promise.all([
    getExpenses(),
    getUserSettings(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">
              View and manage all your expenses
            </p>
          </div>
          <Link href="/dashboard/add-expense">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>

        {/* Transactions List with Filters */}
        <TransactionsList
          initialExpenses={expenses}
          currency={settings.currency}
        />
      </div>
    </div>
  );
}
