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

  console.log(
    `[HONEYPOT] Trap triggered by IP: ${sanitizedIp} | Path: ${path} | Agent: ${userAgent}`
  );

  // 1. Immediately ban the attacker using service role (bypass RLS)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: upsertError } = await supabaseAdmin
    .from("blocked_ips")
    .upsert(
      {
        ip: sanitizedIp,
        reason: "Honeypot Triggered: Accessing forbidden system files",
        expires_at: expiresAt,
        country: request.headers.get("x-vercel-ip-country") || "Unknown",
        city: request.headers.get("x-vercel-ip-city") || "Unknown",
      },
      { onConflict: "ip" }
    );

  if (upsertError) {
    console.error("[HONEYPOT] Ban write failed:", upsertError.message);
  } else {
    console.log(`[HONEYPOT] IP ${sanitizedIp} successfully banned and added to Hall of Shame.`);
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

  // 3. Respond with a deceptive 500 to avoid tipping off the attacker
  return new NextResponse(
    JSON.stringify({ error: "Internal Server Error", code: 500 }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Error-Code": "INTERNAL_SERVER_ERROR",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  return trapAttacker(request);
}

export async function POST(request: NextRequest) {
  return trapAttacker(request);
}
