import { NextRequest, NextResponse } from "next/server";
import { formatSafeIP } from "@/lib/security-utils";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function trapAttacker(request: NextRequest) {
  const rawIp =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "Unknown";
  const sanitizedIp = formatSafeIP(rawIp);
  const userAgent = request.headers.get("user-agent") || "Unknown Agent";
  const path = request.nextUrl.pathname;

  // 1. Immediately ban the attacker PERMANENTLY using service role (bypass RLS)
  const { error: upsertError } = await supabaseAdmin
    .from("blocked_ips")
    .upsert(
      {
        ip: sanitizedIp,
        reason: "Honeypot Triggered: Accessing forbidden system files",
        expires_at: null, // PERMANENT BAN for honeypot triggers
        country: request.headers.get("x-vercel-ip-country") || "Unknown",
        city: request.headers.get("x-vercel-ip-city") || "Unknown",
      },
      { onConflict: "ip" }
    );

  if (upsertError) {
    console.error("[HONEYPOT] Ban write failed:", upsertError.message);
  }

  // 2. Log the honeypot event in activity_logs for Hall of Shame
  await supabaseAdmin.from("activity_logs").insert({
    action: "HONEYPOT_TRIGGERED",
    details: `Honeypot accessed at path: ${path} | IP: ${sanitizedIp} | User-Agent: ${userAgent}`,
    admin_email: "System/Honeypot",
    isp: sanitizedIp,
    country: request.headers.get("x-vercel-ip-country") || null,
    city: request.headers.get("x-vercel-ip-city") || null,
  });

  // 3. Actively expel the attacker to the banned interface
  return NextResponse.redirect(new URL('/banned', request.url));
}

export async function GET(request: NextRequest) {
  return trapAttacker(request);
}

export async function POST(request: NextRequest) {
  return trapAttacker(request);
}
