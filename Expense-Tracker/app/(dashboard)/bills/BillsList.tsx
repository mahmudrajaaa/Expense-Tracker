"use client";

import { useRouter } from "next/navigation";
import { BillCard } from "@/components/bills/BillCard";
import type { Bill } from "@/types/database.types";

interface BillWithStatus extends Bill {
  status: "paid" | "pending" | "overdue";
}

interface BillsListProps {
  bills: BillWithStatus[];
  currency: string;
}

export function BillsList({ bills, currency }: BillsListProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const handleDelete = () => {
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          currency={currency}
          status={bill.status}
          showActions={true}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
