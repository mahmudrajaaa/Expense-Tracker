"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import type { Category, PaymentMode } from "@/types/database.types";

const expenseSchema = z.object({
  item: z.string().min(1, "Item name is required").max(100, "Item name too long"),
  amount: z.number().positive("Amount must be greater than 0").max(1000000, "Amount too large"),
  category: z.enum(["food", "transport", "groceries", "bills", "personal", "others"]),
  payment_mode: z.enum(["cash", "upi", "card"]),
  date: z.date(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (data: ExpenseFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  currency?: string;
}

export function ExpenseForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Add Expense",
  currency = "₹",
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      item: defaultValues?.item || "",
      amount: defaultValues?.amount || undefined,
      category: defaultValues?.category || undefined,
      payment_mode: defaultValues?.payment_mode || undefined,
      date: defaultValues?.date || new Date(),
      notes: defaultValues?.notes || "",
    },
  });

  const selectedDate = watch("date");
  const selectedCategory = watch("category");
  const selectedPaymentMode = watch("payment_mode");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="item">
          Item Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="item"
          placeholder="e.g., Coffee, Groceries, Taxi"
          {...register("item")}
          disabled={isSubmitting}
        />
        {errors.item && (
          <p className="text-sm text-red-500">{errors.item.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          Amount ({currency}) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue("category", value as Category)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category">
              {selectedCategory && (
                <span className="flex items-center gap-2">
                  <span>
                    {CATEGORIES.find((c) => c.value === selectedCategory)?.icon}
                  </span>
                  <span>
                    {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

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

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
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
              onSelect={(date) => date && setValue("date", date)}
              initialFocus
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Notes (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes..."
          rows={3}
          {...register("notes")}
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
