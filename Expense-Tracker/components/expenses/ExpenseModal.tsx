"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm, type ExpenseFormValues } from "./ExpenseForm";
import { createExpense, updateExpense } from "@/actions/expenses";
import type { Expense } from "@/types/database.types";

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  currency?: string;
  onSuccess?: () => void;
}

export function ExpenseModal({
  open,
  onOpenChange,
  expense,
  currency = "₹",
  onSuccess,
}: ExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!expense;

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateExpense(expense.id, data);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense(data);
        toast.success("Expense added successfully!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update expense. Please try again."
          : "Failed to add expense. Please try again."
      );
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: Partial<ExpenseFormValues> | undefined = expense
    ? {
        item: expense.item,
        amount: Number(expense.amount),
        category: expense.category,
        payment_mode: expense.payment_mode,
        date: new Date(expense.date),
        notes: expense.notes || "",
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your expense below."
              : "Fill in the details to add a new expense."}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Update Expense" : "Add Expense"}
          currency={currency}
        />
      </DialogContent>
    </Dialog>
  );
}
