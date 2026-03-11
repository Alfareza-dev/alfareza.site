import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(request: NextRequest) {
  // 1. Extract IP Address
  let ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'Unknown';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();

  // 2. IP Shield - Check if IP is blocked
  const { data: blocked } = await supabaseAdmin
    .from('blocked_ips')
    .select('id')
    .eq('ip', ip)
    .maybeSingle();

  if (blocked && !request.nextUrl.pathname.startsWith('/banned')) {
    const url = request.nextUrl.clone();
    url.pathname = '/banned';
    return NextResponse.redirect(url);
  }

  // 3. Visitor Logger (Exclude admin and auth routes)
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/admin') && !path.startsWith('/auth')) {
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    // Fire the insert to track page views uniquely per hit
    await supabaseAdmin.from('visitor_stats').insert({
      path,
      ip_address: ip,
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
