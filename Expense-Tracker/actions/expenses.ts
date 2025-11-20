"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Expense, ExpenseFormData } from "@/types/database.types";

export async function getExpenses(limit?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Expense[];
}

export async function getExpensesByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Expense[];
}

export async function getExpensesByCategory(category: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", category)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Expense[];
}

export async function createExpense(expenseData: ExpenseFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        user_id: user.id,
        item: expenseData.item,
        amount: expenseData.amount,
        category: expenseData.category,
        payment_mode: expenseData.payment_mode,
        date: expenseData.date.toISOString(),
        notes: expenseData.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return data as Expense;
}

export async function updateExpense(id: string, expenseData: Partial<ExpenseFormData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const updateData: any = { ...expenseData };
  if (expenseData.date) {
    updateData.date = expenseData.date.toISOString();
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTodayExpenses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", today.toISOString())
    .lt("date", tomorrow.toISOString())
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Expense[];
}

export async function getMonthExpenses(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Expense[];
}
