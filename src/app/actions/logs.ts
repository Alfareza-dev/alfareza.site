"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { headers } from "next/headers";

export async function getIPAddress() {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headersList.get("x-real-ip") || "Unknown IP";
  } catch (e) {
    return "Unknown IP";
  }
}

export async function createLog(action: string, details: string, emailFallback?: string) {
  const supabase = await createClient();

  // Validasi user login (Owner only)
  const { data: { user } } = await supabase.auth.getUser();
  
  const isOwner = user?.email === "alfareza.dev@gmail.com";
  const isLoginAction = action === "ADMIN_LOGIN" && emailFallback === "alfareza.dev@gmail.com";
  const isLogoutAction = action === "ADMIN_LOGOUT" && (user?.email === "alfareza.dev@gmail.com" || emailFallback === "alfareza.dev@gmail.com");

  if (!isOwner && !isLoginAction && !isLogoutAction) {
    console.error("Failed to create log: Unauthorized. Action:", action);
    return;
  }

  const admin_email = user?.email || emailFallback || "System/Pending Auth";
  
  let finalDetails = details;
  if (action === "ADMIN_LOGIN" || action === "ADMIN_LOGOUT") {
    const ip = await getIPAddress();
    finalDetails = `${details} (IP: ${ip})`;
  }

  // Use the admin client (Service Role) to confidently bypass RLS and insert the log securely
  const { error: insertError } = await supabaseAdmin
    .from("activity_logs")
    .insert({
      action,
      details: finalDetails,
      admin_email,
    });

  if (insertError) {
    console.error("Failed to insert activity log:", insertError);
  }
}

export async function logFailedLogin(emailAttempt: string) {
  const ip = await getIPAddress();
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Check how many failures from this IP in the last 10 minutes
  const { data: recentFailures } = await supabaseAdmin
    .from("activity_logs")
    .select("id")
    .in("action", ["LOGIN_FAILURE", "SECURITY_ALERT_CRITICAL"])
    .like("details", `%IP: ${ip}%`)
    .gte("created_at", tenMinsAgo);

  const failureCount = recentFailures?.length || 0;
  
  // > 5 failures means 6th attempt triggers critical
  const actionName = failureCount >= 5 ? "SECURITY_ALERT_CRITICAL" : "LOGIN_FAILURE";
  const details = `Failed login attempt from IP: ${ip}. Username: ${emailAttempt}`;

  const { error: insertError } = await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: actionName,
      details,
      admin_email: "System/Security",
    });

  if (insertError) {
    console.error("Failed to record login failure:", insertError);
  }
}

export async function blockIPAddress(
  ip: string, 
  reason: string = "Manual block triggered by Administrator",
  duration: "24h" | "permanent" = "24h"
) {
  const supabase = await createClient();

  // Validate user login
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "alfareza.dev@gmail.com" && reason !== "Honeypot Triggered: Automated Bot Detection" && !reason.includes("Rate Limit Exceeded")) {
    return { success: false, message: "Unauthorized to block IPs." };
  }

  // Calculate explicit expiry
  let expiresAt: string | null = null;
  if (duration === "24h") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  // Attempt to insert into blocked_ips
  const { error: blockError } = await supabaseAdmin
    .from("blocked_ips")
    .insert({ ip, reason, expires_at: expiresAt });

  // Handle unique violation (Postgres error code '23505')
  if (blockError) {
    if (blockError.code === '23505') {
       return { success: true, message: "IP is already blocked." };
    }
    console.error("Failed to block IP:", blockError);
    return { success: false, message: "Failed to block IP due to a server error." };
  }

  // Create log in activity logs
  await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: "IP_BANNED",
      details: `IP Address Blocked: ${ip}. Reason: ${reason}`,
      admin_email: user?.email || "System/Security",
    });
    
  return { success: true, message: "IP successfully blocked." };
}


