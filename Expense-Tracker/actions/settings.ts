"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserSettings } from "@/types/database.types";

export async function getUserSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // If no settings exist, create default settings
    const { data: newData, error: insertError } = await supabase
      .from("user_settings")
      .insert([{ user_id: user.id }])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return newData as UserSettings;
  }

  return data as UserSettings;
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .update(settings)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return data as UserSettings;
}
