"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { formatSafeIP } from "@/lib/security-utils";
import { revalidatePath } from "next/cache";

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
  const sanitizedIp = await getIPAddress();

  if (action === "ADMIN_LOGIN" || action === "ADMIN_LOGOUT") {
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
        lat: geodata.lat,
        lon: geodata.lon,
      }),
      isp: (action === "ADMIN_LOGIN" || action === "ADMIN_LOGOUT") ? sanitizedIp : (geodata?.isp || "Local/Unknown"),
    });

  if (insertError) {
    console.error("Failed to insert activity log:", insertError);
  }
}

export async function logFailedLogin(emailAttempt: string): Promise<{ isBanned: boolean }> {
  try {
    const sanitizedIp = await getIPAddress();
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // 1. Insert the failed login log FIRST unconditionally
    const details = `Failed login attempt from IP: ${sanitizedIp} | Username: ${emailAttempt}`;
    const geodata = await fetchIPGeolocation(sanitizedIp);

    const { data: insertedLog, error: insertError } = await supabaseAdmin
      .from("activity_logs")
      .insert({
        action: "LOGIN_FAILURE",
        details,
        admin_email: "System/Security",
        ...(geodata && {
          country: geodata.country,
          city: geodata.city,
          lat: geodata.lat,
          lon: geodata.lon,
        }),
        isp: sanitizedIp,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[DB ERROR] Failed to record login failure:", insertError.code, insertError.message);
    }

    // 2. NOW check how many failures from this IP in the last 10 minutes (inclusive of the one just inserted)
    const { data: recentFailures, error: countError } = await supabaseAdmin
      .from("activity_logs")
      .select("id")
      .in("action", ["LOGIN_FAILURE", "SECURITY_ALERT_CRITICAL"])
      .eq("isp", sanitizedIp)
      .gte("created_at", tenMinsAgo);

    if (countError) {
      console.error("[DB ERROR] Failed to count login failures:", countError.code, countError.message);
    }

    const failureCount = recentFailures?.length || 0;

    // 3. 5-STRIKE AUTO BLOCK EXECUTION
    if (failureCount >= 5) {
      console.log(`[SECURITY] 5-Strike Auto-Ban Executed for IP: ${sanitizedIp}`);
      
      // Upgrade the just-inserted log to CRITICAL instead
      if (insertedLog) {
        await supabaseAdmin
          .from("activity_logs")
          .update({ action: "SECURITY_ALERT_CRITICAL" })
          .eq("id", insertedLog.id);
      }

      // Await the block and dynamically reload Admin panels
      await blockIPAddress(sanitizedIp, "Auto-blocked: Multiple failed login attempts (>5 in 10 minutes)", "24h");
      
      // UI force-revalidation happens within blockIPAddress after DB confirms write success
      return { isBanned: true };
    }
    
    return { isBanned: false };
  } catch (err) {
    console.error(`[SECURITY] FATAL Auto-Ban sequence failed:`, err);
    return { isBanned: false }; // Fail silently to client, leave alert in Vercel logs
  }
}

export async function blockIPAddress(
  rawIp: string, 
  reason: string = "Manual block triggered by Administrator",
  duration: "24h" | "permanent" = "24h"
) {
  const sanitizedIp = formatSafeIP(rawIp);
  const supabase = await createClient();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("MISSING SERVICE ROLE KEY!");
  }

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

  console.log("--- INITIATING DATABASE UPSERT FOR IP:", sanitizedIp);
  const headersList = await headers();
  // Attempt to insert into blocked_ips
  const { data, error } = await supabaseAdmin
    .from('blocked_ips')
    .upsert({ 
      ip: sanitizedIp, 
      reason: reason || "Auto-blocked: 5+ failed attempts",
      expires_at: expiresAt,
      country: headersList.get('x-vercel-ip-country'),
      city: headersList.get('x-vercel-ip-city'),
      isp: geodata?.isp || "Detected Provider",
      lat: parseFloat(headersList.get('x-vercel-ip-latitude') || '0'),
      lon: parseFloat(headersList.get('x-vercel-ip-longitude') || '0')
    }, { onConflict: 'ip' })
    .select();

  if (error) {
    console.error("[DATABASE FATAL] Upsert failed:", error.message, "Code:", error.code);
    throw new Error(`DB Write Failed: ${error.message}`);
  }

  // Explicit Success Trace
  console.log("[DATABASE SUCCESS] IP Locked in Table:", sanitizedIp, data);

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
        lat: geodata.lat,
        lon: geodata.lon,
      }),
      isp: sanitizedIp,
    });
    
  // Explicitly sync the cache only on perfect db confirmation execution bounds
  revalidatePath('/admin');
  revalidatePath('/admin/security');
  
  return { success: true, message: "IP successfully blocked." };
}


