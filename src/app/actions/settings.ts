"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleMaintenance(targetStatus: boolean): Promise<{ success: boolean; message?: string }> {
  // Authorization check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "alfareza.dev@gmail.com") {
    return { success: false, message: "Unauthorized" };
  }

  const newValue = targetStatus ? "true" : "false";

  const { error } = await supabaseAdmin
    .from("site_settings")
    .update({ value: newValue, updated_at: new Date().toISOString() })
    .eq("key", "maintenance_mode");

  if (error) {
    console.error("[MAINTENANCE TOGGLE] Failed:", error.message);
    return { success: false, message: error.message };
  }

  console.log(`[MAINTENANCE TOGGLE] Mode set to: ${newValue} by ${user.email}`);

  // Log the action
  await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: targetStatus ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
      details: `Maintenance mode ${targetStatus ? "enabled" : "disabled"} by ${user.email}`,
      admin_email: user.email,
    });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true };
}

export async function getMaintenanceStatus(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .maybeSingle();

  return data?.value === "true";
}
