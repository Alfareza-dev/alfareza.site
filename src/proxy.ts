import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { createClient } from "@supabase/supabase-js"
import { formatSafeIP } from "@/lib/security-utils"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Common attacker probe paths — silently redirect all to the honeypot
const HONEYPOT_ROUTES = [
  '/.env',
  '/.env.local',
  '/.env.production',
  '/wp-login.php',
  '/wp-admin',
  '/wp-config.php',
  '/admin.php',
  '/phpmyadmin',
  '/.git/config',
  '/xmlrpc.php',
  '/config.php',
  '/setup.php',
  '/install.php',
  '/shell.php',
  '/backup.zip',
  '/db.sql',
];

export async function proxy(request: NextRequest) {
  // Quick bypass for static assets to avoid unnecessary DB queries
  const path = request.nextUrl.pathname;
  if (path.startsWith('/_next/') || path.includes('.') && !HONEYPOT_ROUTES.includes(path)) {
    return await updateSession(request);
  }

  // 0. HONEYPOT: Silently catch known attacker probe paths
  if (HONEYPOT_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/honeypot';
    return NextResponse.rewrite(url);
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

  // Priority 1: BANNED — If IP is blocked, force /banned immediately
  if (isBlocked && !path.startsWith('/banned')) {
    const url = request.nextUrl.clone();
    url.pathname = '/banned';
    return NextResponse.rewrite(url);
  }

  // Priority 2: ADMIN BYPASS — Always allow /auth, /admin, /banned, /maintenance through
  const bypassRoutes = ['/auth', '/admin', '/banned', '/maintenance', '/api'];
  const isBypassRoute = bypassRoutes.some(route => path.startsWith(route));

  // Priority 3: MAINTENANCE MODE — Check site_settings table
  if (!isBypassRoute) {
    try {
      const maintenanceRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          },
          cache: 'force-cache',
          next: { tags: ['site_settings'] },
        }
      );

      if (maintenanceRes.ok) {
        const settings = await maintenanceRes.json();
        if (settings?.[0]?.value === 'true') {
          const url = request.nextUrl.clone();
          url.pathname = '/maintenance';
          return NextResponse.rewrite(url);
        }
      }
    } catch (e) {
      console.error("[MAINTENANCE] Settings check failed:", e);
    }
  }

  // 4. Visitor Logger (Exclude admin, auth, banned, maintenance routes)
  if (!isBypassRoute && !path.startsWith('/banned')) {
    const userAgent = request.headers.get('user-agent') || 'Unknown';
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
     * - public files (.png, .jpg, .jpeg, .svg, .webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
