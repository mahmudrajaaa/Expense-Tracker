import type { Category, PaymentMode } from "@/types/database.types";

export interface CategoryOption {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export interface PaymentModeOption {
  value: PaymentMode;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryOption[] = [
  { value: "food", label: "Food", icon: "🍔", color: "bg-orange-100 text-orange-800" },
  { value: "transport", label: "Transport", icon: "🚗", color: "bg-blue-100 text-blue-800" },
  { value: "groceries", label: "Groceries", icon: "🛒", color: "bg-green-100 text-green-800" },
  { value: "bills", label: "Bills", icon: "📄", color: "bg-purple-100 text-purple-800" },
  { value: "personal", label: "Personal", icon: "👤", color: "bg-pink-100 text-pink-800" },
  { value: "others", label: "Others", icon: "📦", color: "bg-gray-100 text-gray-800" },
];

export const PAYMENT_MODES: PaymentModeOption[] = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "upi", label: "UPI", icon: "📱" },
  { value: "card", label: "Card", icon: "💳" },
];
