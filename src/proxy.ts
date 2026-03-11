import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { createClient } from "@supabase/supabase-js"
import { formatSafeIP } from "@/lib/security-utils"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function proxy(request: NextRequest) {
  console.log("--- SECURITY DEBUG START ---");
  console.log("All Headers:", JSON.stringify(Object.fromEntries(request.headers.entries())));
  console.log("--- SECURITY DEBUG END ---");

  // Quick bypass for static assets to avoid unnecessary DB queries
  const path = request.nextUrl.pathname;
  if (path.startsWith('/_next/') || path.includes('.')) {
    return await updateSession(request);
  }

  // 1. Extract IP Address securely
  const rawIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'Unknown';
  const sanitizedIp = formatSafeIP(rawIp);

  // 2. IP Shield - Check if IP is actively blocked and not expired
  const nowIso = new Date().toISOString();
  let isBlocked = false;

  try {
    // Explicit REST Fetch to guarantee cache bust at the Edge
    const blockCheckResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blocked_ips?ip=eq.${sanitizedIp}&select=id,expires_at`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      }
    );
    
    if (blockCheckResponse.ok) {
      const data = await blockCheckResponse.json();
      if (data && data.length > 0) {
        const expiresAt = data[0].expires_at;
        if (!expiresAt || expiresAt > nowIso) {
          isBlocked = true;
        }
      }
    }
  } catch (e) {
    console.error("Middleware Cache-Bust Check Failed:", e);
  }

  console.log("Checking Sanitized IP:", sanitizedIp, "| Match Found:", isBlocked);

  if (isBlocked && !path.startsWith('/banned')) {
    const url = request.nextUrl.clone();
    url.pathname = '/banned';
    return NextResponse.rewrite(url);
  }

  // 3. Visitor Logger (Exclude admin and auth routes)
  if (!path.startsWith('/admin') && !path.startsWith('/auth') && !path.startsWith('/banned')) {
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    // Fire the insert to track page views uniquely per hit
    await supabaseAdmin.from('visitor_stats').insert({
      path,
      ip_address: sanitizedIp,
      user_agent: userAgent
    });
  }

  // 4. Standard Session Update for Protected Routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
