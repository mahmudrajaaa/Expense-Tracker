"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteBill } from "@/actions/bills";
import { formatCurrency, getCategoryIcon } from "@/lib/calculations";
import type { Bill } from "@/types/database.types";

interface DeleteBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill;
  currency?: string;
  onSuccess?: () => void;
}

export function DeleteBillDialog({
  open,
  onOpenChange,
  bill,
  currency = "₹",
  onSuccess,
}: DeleteBillDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteBill(bill.id);
      toast.success("Bill deleted successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete bill. Please try again.");
      console.error("Error deleting bill:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Bill</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this bill? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Bill Details */}
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            {bill.category && (
              <div className="text-2xl">{getCategoryIcon(bill.category)}</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{bill.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {bill.category && `${bill.category} • `}
                Due on {bill.due_date}{getDaySuffix(bill.due_date)} of every month
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {bill.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="font-bold text-gray-900">
              {formatCurrency(Number(bill.amount), currency)}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Deleting this bill will not delete any payment history or expense
            entries that were already created. Only the recurring bill configuration will be removed.
          </p>
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
            {isDeleting ? "Deleting..." : "Delete Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
