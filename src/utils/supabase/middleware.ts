import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. BYPASS STATIC ASSETS & EXEMPT ROUTES
  // Next.js middleware runs on every request. We must bypass static files, API routes, and the banned page.
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/banned" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp)$/)
  ) {
    return supabaseResponse
  }

  // 2. IP EXTRACTION
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "Unknown"

  // 3. IP BLOCKING ENFORCEMENT
  // Edge runtime safe query using the anon key via createServerClient
  const { data: blockedIp } = await supabase
    .from("blocked_ips")
    .select("ip, expires_at")
    .eq("ip", ip)
    .single()

  if (blockedIp) {
    const isForever = !blockedIp.expires_at
    const isStillActive = blockedIp.expires_at && new Date(blockedIp.expires_at).getTime() > Date.now()
    
    if (isForever || isStillActive) {
      const url = request.nextUrl.clone()
      url.pathname = "/banned"
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. SESSION EXPIRY (2-Hour Hard Limit)
  if (user && user.last_sign_in_at) {
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000
    const timeSinceLogin = Date.now() - new Date(user.last_sign_in_at).getTime()
    
    if (timeSinceLogin > TWO_HOURS_MS) {
      // Session expired. Kill it locally.
      await supabase.auth.signOut({ scope: "local" })
      
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      url.searchParams.set("error", "timeout")
      return NextResponse.redirect(url)
    }
  }

  // 5. STANDARD ADMIN PROTECTION
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
