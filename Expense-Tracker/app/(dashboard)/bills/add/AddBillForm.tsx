"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BillForm, type BillFormValues } from "@/components/bills/BillForm";
import { createBill } from "@/actions/bills";

interface AddBillFormProps {
  currency: string;
}

export function AddBillForm({ currency }: AddBillFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BillFormValues) => {
    setIsSubmitting(true);

    try {
      await createBill(data);
      toast.success("Bill added successfully!");
      router.push("/bills");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add bill. Please try again.");
      console.error("Error adding bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BillForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Add Bill"
      currency={currency}
    />
  );
}
