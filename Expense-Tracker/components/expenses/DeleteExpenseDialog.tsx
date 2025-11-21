"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/actions/expenses";
import { formatCurrency, getCategoryIcon } from "@/lib/calculations";
import type { Expense } from "@/types/database.types";

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
  currency?: string;
  onSuccess?: () => void;
}

export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expense,
  currency = "₹",
  onSuccess,
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete expense. Please try again.");
      console.error("Error deleting expense:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Expense Details */}
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{expense.item}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {expense.category} • {expense.payment_mode}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(expense.date), "MMMM d, yyyy")}
              </p>
              {expense.notes && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  "{expense.notes}"
                </p>
              )}
            </div>
            <div className="font-bold text-gray-900">
              {formatCurrency(Number(expense.amount), currency)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
