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
import { BillForm, type BillFormValues } from "./BillForm";
import { createBill, updateBill } from "@/actions/bills";
import type { Bill } from "@/types/database.types";

interface BillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill;
  currency?: string;
  onSuccess?: () => void;
}

export function BillModal({
  open,
  onOpenChange,
  bill,
  currency = "₹",
  onSuccess,
}: BillModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!bill;

  const handleSubmit = async (data: BillFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateBill(bill.id, data);
        toast.success("Bill updated successfully!");
      } else {
        await createBill(data);
        toast.success("Bill added successfully!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update bill. Please try again."
          : "Failed to add bill. Please try again."
      );
      console.error("Error saving bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: Partial<BillFormValues> | undefined = bill
    ? {
        name: bill.name,
        amount: Number(bill.amount),
        due_date: bill.due_date,
        category: bill.category || "",
        is_active: bill.is_active,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bill" : "Add New Bill"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your recurring bill below."
              : "Fill in the details to add a new recurring bill."}
          </DialogDescription>
        </DialogHeader>
        <BillForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Update Bill" : "Add Bill"}
          currency={currency}
        />
      </DialogContent>
    </Dialog>
  );
}
