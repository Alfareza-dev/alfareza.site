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
      const res = await blockIPAddress(sanitizedIp, "Auto-blocked: 5+ failed login attempts", "24h", true);
      
      console.log(`[SECURITY] Auto-Ban persistent status: ${res.success}`);
      
      // Return isBanned only after confirmed DB write
      return { isBanned: res.success };
    }
    
    return { isBanned: false };
  } catch (err) {
    console.error(`[SECURITY] FATAL Auto-Ban sequence failed:`, err);
    return { isBanned: false }; 
  }
}

export async function blockIPAddress(
  rawIp: string, 
  reason: string = "Manual block triggered by Administrator",
  duration: "24h" | "permanent" = "24h",
  isSystemAction: boolean = false
): Promise<{ success: boolean; message?: string }> {
  const sanitizedIp = formatSafeIP(rawIp);
  console.log("--- ATTEMPTING DB UPSERT (System Authority: " + isSystemAction + ") ---");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is MISSING!");
  }

  const supabase = await createClient();

  // 1. Authorization Check (Bypass if system action)
  let adminEmail = "System/Security";
  
  if (!isSystemAction) {
    // Validate user login for manual actions
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== "alfareza.dev@gmail.com") {
      console.error("Unauthorized manual block attempt for IP:", sanitizedIp);
      return { success: false, message: "Unauthorized to block IPs manually." };
    }
    adminEmail = user.email;
  }

  // Calculate explicit expiry
  let expiresAt: string | null = null;
  if (duration === "24h") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  // Execute the Geolocation trap
  const geodata = await fetchIPGeolocation(sanitizedIp);
  const headersList = await headers();

  // 1. Perform the Upsert and CONFIRM with select()
  const { data, error: dbError } = await supabaseAdmin
    .from('blocked_ips')
    .upsert({ 
      ip: sanitizedIp, 
      reason: reason || "Auto-blocked: 5+ failed attempts",
      expires_at: expiresAt,
      country: headersList.get('x-vercel-ip-country') || 'Unknown',
      city: headersList.get('x-vercel-ip-city') || 'Unknown',
      isp: geodata?.isp || "Detected Provider",
      lat: parseFloat(headersList.get('x-vercel-ip-latitude') || '0'),
      lon: parseFloat(headersList.get('x-vercel-ip-longitude') || '0')
    }, { onConflict: 'ip' })
    .select();

  if (dbError) {
    console.error("DB UPSERT FAILED:", dbError.message, dbError.code);
    return { success: false, message: dbError.message };
  } 

  console.log("DB UPSERT CONFIRMED:", data);

  // 2. Log the ban event in activity_logs (sequential)
  await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: "IP_BANNED",
      details: `IP Address Blocked: ${sanitizedIp}. Reason: ${reason}`,
      admin_email: adminEmail,
      ...(geodata && {
        country: geodata.country,
        city: geodata.city,
        lat: geodata.lat,
        lon: geodata.lon,
      }),
      isp: sanitizedIp,
    });
    
  // 3. Await revalidation to ensure sync before returning
  await revalidatePath('/admin');
  await revalidatePath('/admin/security');
  
  return { success: true };
}

export async function unblockIPAddress(rawIp: string): Promise<{ success: boolean; message?: string }> {
  const sanitizedIp = formatSafeIP(rawIp);

  // Authorization check — only admin can unblock
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "alfareza.dev@gmail.com") {
    console.error("Unauthorized unblock attempt for IP:", sanitizedIp);
    return { success: false, message: "Unauthorized" };
  }

  // Delete from blocked_ips
  const { error: deleteError } = await supabaseAdmin
    .from("blocked_ips")
    .delete()
    .eq("ip", sanitizedIp);

  if (deleteError) {
    console.error("[UNBLOCK] Delete failed:", deleteError.message);
    return { success: false, message: deleteError.message };
  }

  console.log(`[UNBLOCK] IP ${sanitizedIp} removed from blocked_ips`);

  // Log the unblock event
  await supabaseAdmin
    .from("activity_logs")
    .insert({
      action: "IP_UNBLOCKED",
      details: `IP Address Unblocked: ${sanitizedIp} by ${user.email}`,
      admin_email: user.email,
      isp: sanitizedIp,
    });

  await revalidatePath("/admin");
  await revalidatePath("/admin/security");

  return { success: true };
}

export async function markAsRead(messageId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "alfareza.dev@gmail.com") {
    return { success: false, message: "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);

  if (error) {
    console.error("[MARK READ] Failed:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}
