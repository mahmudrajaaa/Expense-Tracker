"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expenses/ExpenseForm";
import { createExpense } from "@/actions/expenses";

interface AddExpenseFormProps {
  currency: string;
}

export function AddExpenseForm({ currency }: AddExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);

    try {
      await createExpense(data);
      toast.success("Expense added successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
      console.error("Error adding expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExpenseForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Add Expense"
      currency={currency}
    />
  );
}
