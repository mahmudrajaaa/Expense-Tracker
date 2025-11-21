"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillModal } from "@/components/bills/BillModal";

interface BillsClientProps {
  currency: string;
}

export function BillsClient({ currency }: BillsClientProps) {
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const handleBillSuccess = () => {
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
          onClick={() => setIsBillModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Bill Modal */}
      <BillModal
        open={isBillModalOpen}
        onOpenChange={setIsBillModalOpen}
        currency={currency}
        onSuccess={handleBillSuccess}
      />
    </>
  );
}
