"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required").max(100, "Bill name too long"),
  amount: z.number().positive("Amount must be greater than 0").max(1000000, "Amount too large"),
  due_date: z.number().min(1, "Due date must be between 1-31").max(31, "Due date must be between 1-31"),
  category: z.string().optional(),
  is_active: z.boolean(),
});

export type BillFormValues = z.infer<typeof billSchema>;

interface BillFormProps {
  defaultValues?: Partial<BillFormValues>;
  onSubmit: (data: BillFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  currency?: string;
}

export function BillForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Add Bill",
  currency = "₹",
}: BillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amount: defaultValues?.amount || undefined,
      due_date: defaultValues?.due_date || undefined,
      category: defaultValues?.category || "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const selectedCategory = watch("category");
  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Bill Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Bill Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Electricity Bill, WiFi, Rent"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
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

      {/* Due Date (Day of Month) */}
      <div className="space-y-2">
        <Label htmlFor="due_date">
          Due Date (Day of Month) <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch("due_date")?.toString()}
          onValueChange={(value) => setValue("due_date", parseInt(value))}
          disabled={isSubmitting}
        >
          <SelectTrigger id="due_date">
            <SelectValue placeholder="Select day (1-31)">
              {watch("due_date") && `${watch("due_date")}${getDaySuffix(watch("due_date"))} of every month`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}{getDaySuffix(day)} of every month
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.due_date && (
          <p className="text-sm text-red-500">{errors.due_date.message}</p>
        )}
      </div>

      {/* Category (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue("category", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category (optional)">
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
            <SelectItem value="">None</SelectItem>
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
        <p className="text-xs text-gray-500">
          Category will be used when marking bill as paid
        </p>
      </div>

      {/* Is Active Toggle */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            {...register("is_active")}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active Bill
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          {isActive
            ? "Bill is active and will appear in your bills list"
            : "Inactive bills are hidden but can be reactivated later"}
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
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
