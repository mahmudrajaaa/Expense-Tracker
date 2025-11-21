"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";

interface DashboardClientProps {
  currency: string;
}

export function DashboardClient({ currency }: DashboardClientProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleExpenseSuccess = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsExpenseModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        currency={currency}
        onSuccess={handleExpenseSuccess}
      />
    </>
  );
}
