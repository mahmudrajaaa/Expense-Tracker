"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PAYMENT_MODES } from "@/lib/constants";
import { markBillAsPaid } from "@/actions/bills";
import type { Bill } from "@/types/database.types";
import type { PaymentMode } from "@/types/database.types";

const payBillSchema = z.object({
  payment_mode: z.enum(["cash", "upi", "card"]),
  paid_date: z.date(),
});

type PayBillFormValues = z.infer<typeof payBillSchema>;

interface PayBillFormProps {
  bill: Bill;
  currency: string;
}

export function PayBillForm({ bill, currency }: PayBillFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PayBillFormValues>({
    resolver: zodResolver(payBillSchema),
    defaultValues: {
      payment_mode: undefined,
      paid_date: new Date(),
    },
  });

  const selectedPaymentMode = watch("payment_mode");
  const selectedDate = watch("paid_date");

  const onSubmit = async (data: PayBillFormValues) => {
    setIsSubmitting(true);

    try {
      await markBillAsPaid(bill, data.payment_mode, data.paid_date);
      toast.success("Bill marked as paid successfully!");
      router.push("/bills");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark bill as paid";
      toast.error(errorMessage);
      console.error("Error marking bill as paid:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Payment Mode */}
      <div className="space-y-2">
        <Label htmlFor="payment_mode">
          Payment Mode <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedPaymentMode}
          onValueChange={(value) => setValue("payment_mode", value as PaymentMode)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="payment_mode">
            <SelectValue placeholder="Select payment mode">
              {selectedPaymentMode && (
                <span className="flex items-center gap-2">
                  <span>
                    {PAYMENT_MODES.find((p) => p.value === selectedPaymentMode)?.icon}
                  </span>
                  <span>
                    {PAYMENT_MODES.find((p) => p.value === selectedPaymentMode)?.label}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                <span className="flex items-center gap-2">
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.payment_mode && (
          <p className="text-sm text-red-500">{errors.payment_mode.message}</p>
        )}
      </div>

      {/* Payment Date */}
      <div className="space-y-2">
        <Label htmlFor="paid_date">
          Payment Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="paid_date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setValue("paid_date", date)}
              initialFocus
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
        {errors.paid_date && (
          <p className="text-sm text-red-500">{errors.paid_date.message}</p>
        )}
        <p className="text-xs text-gray-500">
          This will create an expense entry for this payment
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Marking this bill as paid will automatically create an expense entry
          with the selected payment mode and date. The expense will be categorized as{" "}
          <strong>{bill.category || "bills"}</strong>.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/bills")}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Processing..." : "Mark as Paid"}
        </Button>
      </div>
    </form>
  );
}
