"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { headers } from "next/headers";

// Nuclear IP Sanitization Formatter
export function formatSafeIP(rawIP: string | null): string {
  if (!rawIP) return "Unknown IP";
  let ip = String(rawIP); // Explicit cast to secure against unhandled edge properties
  // If list, take first
  if (ip.includes(",")) {
    ip = ip.split(",")[0];
  }
  // Trim spaces and recursive trailing dots
  ip = ip.replace(/[.\s]+$/, "").trim();
  // Strip IPv6 headers
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  return ip || "Unknown IP";
}

export async function getIPAddress() {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    let ip = "Unknown IP";
    if (forwardedFor) {
      ip = forwardedFor;
    } else {
      ip = headersList.get("x-real-ip") || "Unknown IP";
    }
    return formatSafeIP(ip);
  } catch (e) {
    return "Unknown IP";
  }
}

// IP Intelligence Utility for Geofencing - Vercel Native Edge Headers
export async function fetchIPGeolocation(_ip: string) {
  try {
    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country");
    const city = headersList.get("x-vercel-ip-city");
    const latStr = headersList.get("x-vercel-ip-latitude");
    const lonStr = headersList.get("x-vercel-ip-longitude");
    
    // Default to approximate routing context if Vercel headers mutate or fail locally
    if (country) {
      return {
        country: country,
        city: city || "Unknown City",
        isp: "Vercel Edge Proxy",
        lat: latStr ? parseFloat(latStr) : null,
        lon: lonStr ? parseFloat(lonStr) : null,
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to harvest Vercel Geolocation:`, error);
    return null;
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
  let geodata = null;

  if (action === "ADMIN_LOGIN" || action === "ADMIN_LOGOUT") {
    const sanitizedIp = await getIPAddress();
    finalDetails = `${details} (IP: ${sanitizedIp})`;
    // Optionally fetch geodata for every admin login
    if (action === "ADMIN_LOGIN") {
       geodata = await fetchIPGeolocation(sanitizedIp);
    }
  }

  // Use the admin client (Service Role) to confidently bypass RLS and insert the log securely
  const { error: insertError } = await supabaseAdmin
    .from("activity_logs")
    .insert({
      action,
      details: finalDetails,
      admin_email,
      ...(geodata && {
        country: geodata.country,
        city: geodata.city,
        isp: geodata.isp,
        lat: geodata.lat,
        lon: geodata.lon,
      }),
    });

  if (insertError) {
    console.error("Failed to insert activity log:", insertError);
  }
}

export async function logFailedLogin(emailAttempt: string) {
  const sanitizedIp = await getIPAddress();
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Check how many failures from this IP in the last 10 minutes
  const { data: recentFailures } = await supabaseAdmin
    .from("activity_logs")
    .select("id")
    .in("action", ["LOGIN_FAILURE", "SECURITY_ALERT_CRITICAL"])
    .like("details", `%IP: ${sanitizedIp}%`)
    .gte("created_at", tenMinsAgo);

  const failureCount = recentFailures?.length || 0;
  
  // > 5 failures means 6th attempt triggers critical
  const actionName = failureCount >= 5 ? "SECURITY_ALERT_CRITICAL" : "LOGIN_FAILURE";
  const details = `Failed login attempt from IP: ${sanitizedIp}. Username: ${emailAttempt}`;
  
  // Bind Geofencing intelligence against hostile login sources
  const geodata = await fetchIPGeolocation(sanitizedIp);

  const { error: insertError } = await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: actionName,
      details,
      admin_email: "System/Security",
      ...(geodata && {
        country: geodata.country,
        city: geodata.city,
        isp: geodata.isp,
        lat: geodata.lat,
        lon: geodata.lon,
      }),
    });

  if (insertError) {
    console.error("Failed to record login failure:", insertError);
  }
}

export async function blockIPAddress(
  rawIp: string, 
  reason: string = "Manual block triggered by Administrator",
  duration: "24h" | "permanent" = "24h"
) {
  const sanitizedIp = formatSafeIP(rawIp);
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

  // Execute the Geolocation trap to deeply trace the attacker
  const geodata = await fetchIPGeolocation(sanitizedIp);

  // Attempt to insert into blocked_ips
  const { error: blockError } = await supabaseAdmin
    .from("blocked_ips")
    .insert({ 
      ip: sanitizedIp, 
      reason, 
      expires_at: expiresAt,
      ...(geodata && {
        country: geodata.country,
        city: geodata.city,
        isp: geodata.isp,
        lat: geodata.lat,
        lon: geodata.lon,
      })
    });

  // Handle unique violation (Postgres error code '23505')
  if (blockError) {
    if (blockError.code === '23505') {
       return { success: true, message: "IP is already blocked." };
    }
    console.error("Failed to block IP:", blockError);
    return { success: false, message: "Failed to block IP due to a server error." };
  }

  // Create explicit trace block in activity logs identically bound
  await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: "IP_BANNED",
      details: `IP Address Blocked: ${sanitizedIp}. Reason: ${reason}`,
      admin_email: user?.email || "System/Security",
      ...(geodata && {
        country: geodata.country,
        city: geodata.city,
        isp: geodata.isp,
        lat: geodata.lat,
        lon: geodata.lon,
      })
    });
    
  return { success: true, message: "IP successfully blocked." };
}


