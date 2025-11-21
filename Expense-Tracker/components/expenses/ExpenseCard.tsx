"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon, getCategoryColor, getPaymentModeIcon } from "@/lib/calculations";
import { formatCurrency } from "@/lib/calculations";
import type { Expense } from "@/types/database.types";
import { ExpenseModal } from "./ExpenseModal";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";

interface ExpenseCardProps {
  expense: Expense;
  currency?: string;
  showActions?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function ExpenseCard({
  expense,
  currency = "₹",
  showActions = true,
  onUpdate,
  onDelete,
}: ExpenseCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    onUpdate?.();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    onDelete?.();
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Icon and Details */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-2xl flex-shrink-0">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {expense.item}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={getCategoryColor(expense.category)}
                  >
                    {expense.category}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    {getPaymentModeIcon(expense.payment_mode)}
                    <span className="capitalize">{expense.payment_mode}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </span>
                </div>
                {expense.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {expense.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Amount and Actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(Number(expense.amount), currency)}
              </div>
              {showActions && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-8 w-8"
                    aria-label="Edit expense"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ExpenseModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        expense={expense}
        currency={currency}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        expense={expense}
        currency={currency}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
