"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Bill, BillPaid } from "@/types/database.types";
import { createExpense } from "./expenses";

export async function getBills() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Bill[];
}

export async function createBill(billData: Omit<Bill, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("bills")
    .insert([
      {
        user_id: user.id,
        ...billData,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/bills");
  return data as Bill;
}

export async function updateBill(id: string, billData: Partial<Bill>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("bills")
    .update(billData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/bills");
  return data as Bill;
}

export async function deleteBill(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("bills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/bills");
  return { success: true };
}

export async function getBillsPaid(monthYear: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("bills_paid")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthYear);

  if (error) {
    throw new Error(error.message);
  }

  return data as BillPaid[];
}

export async function markBillAsPaid(
  bill: Bill,
  paymentMode: "cash" | "upi" | "card",
  paidDate: Date = new Date()
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const monthYear = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, "0")}`;

  // Check if already paid this month
  const { data: existingPayment } = await supabase
    .from("bills_paid")
    .select("*")
    .eq("user_id", user.id)
    .eq("bill_id", bill.id)
    .eq("month_year", monthYear)
    .single();

  if (existingPayment) {
    throw new Error("Bill already paid for this month");
  }

  // Create bill payment record
  const { error: billPaidError } = await supabase
    .from("bills_paid")
    .insert([
      {
        user_id: user.id,
        bill_id: bill.id,
        bill_name: bill.name,
        amount: bill.amount,
        payment_mode: paymentMode,
        paid_date: paidDate.toISOString(),
        month_year: monthYear,
      },
    ]);

  if (billPaidError) {
    throw new Error(billPaidError.message);
  }

  // Create expense entry
  await createExpense({
    item: `Bill Payment: ${bill.name}`,
    amount: Number(bill.amount),
    category: "bills",
    payment_mode: paymentMode,
    date: paidDate,
    notes: `Recurring bill payment for ${monthYear}`,
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBillStatus(bill: Bill, currentMonth: string): Promise<"paid" | "pending" | "overdue"> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return "pending";
  }

  // Check if paid this month
  const { data } = await supabase
    .from("bills_paid")
    .select("*")
    .eq("user_id", user.id)
    .eq("bill_id", bill.id)
    .eq("month_year", currentMonth)
    .single();

  if (data) {
    return "paid";
  }

  // Check if overdue
  const today = new Date();
  const currentDay = today.getDate();

  if (currentDay > bill.due_date) {
    return "overdue";
  }

  return "pending";
}
