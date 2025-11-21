"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon, formatCurrency } from "@/lib/calculations";
import type { Bill } from "@/types/database.types";
import { BillModal } from "./BillModal";
import { DeleteBillDialog } from "./DeleteBillDialog";

interface BillCardProps {
  bill: Bill;
  currency?: string;
  status: "paid" | "pending" | "overdue";
  showActions?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function BillCard({
  bill,
  currency = "₹",
  status,
  showActions = true,
  onUpdate,
  onDelete,
}: BillCardProps) {
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

  // Get status icon and color
  const getStatusIndicator = () => {
    switch (status) {
      case "paid":
        return {
          icon: <Check className="h-5 w-5" />,
          text: "Paid",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "overdue":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          text: "Overdue",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "pending":
        return {
          icon: <X className="h-5 w-5" />,
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
    }
  };

  const statusInfo = getStatusIndicator();

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Icon and Details */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {bill.category && (
                <div className="text-2xl flex-shrink-0">
                  {getCategoryIcon(bill.category)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {bill.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {bill.category && (
                    <Badge variant="secondary">
                      {bill.category}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    Due: {bill.due_date}{getDaySuffix(bill.due_date)} of month
                  </span>
                  <Badge
                    className={`flex items-center gap-1 ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right: Amount and Actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(Number(bill.amount), currency)}
              </div>
              {showActions && (
                <div className="flex gap-1">
                  {status !== "paid" && (
                    <Link href={`/bills/pay/${bill.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Pay
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-8 w-8"
                    aria-label="Edit bill"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label="Delete bill"
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
      <BillModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        bill={bill}
        currency={currency}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBillDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        bill={bill}
        currency={currency}
        onSuccess={handleDeleteSuccess}
      />
    </>
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
