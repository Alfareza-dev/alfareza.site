# Alfareza Personal Portfolio

A premium portfolio built with Next.js, Supabase, and Vercel Edge.

## 🛡️ Advanced Security Architecture

This project features a production-grade security system designed to prevent unauthorized access and mitigate brute-force attacks at the Edge.

### 1. Auto-Ban System
- **5-Strike Enforcement**: Automated bot detection that blacklists any IP address failing 5+ login attempts within 10 minutes.
- **Service Role Bypass**: Uses `supabaseAdmin` with the `SERVICE_ROLE_KEY` to bypass RLS and guarantee security writes even when the public API is locked.
- **Nuclear IP Sanitization**: Strictly sanitizes all incoming headers to prevent IP-injection and removes trailing residuals (dots/spaces).

### 2. Edge Proxy Protection (`proxy.ts`)
- **Real-time Shield**: Every request headers are intercepted at the Edge and checked against the `blocked_ips` table in Supabase.
- **Cache-Busting Fetch**: Uses a custom fetch implementation with `cache: 'no-store'` and `Pragma: no-cache` to ensure bans are reflected instantly without Edge caching "hang".
- **Intimidating Redirect**: Blocked users are forcefully rewritten to `/banned` with localized geolocation telemetry.

### 3. Admin Security Center
- **Real-time Monitoring**: Glassmorphic dashboard displaying live attack origins, failure logs, and honeypot triggers.
- **Manual Control**: Administrators can manually override or block suspicious IPs directly from the UI.
- **Trace Sequentiality**: All security actions follow a strict `await` chain to ensure database consistency before UI revalidation.

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key_keep_secret
   ```
4. **Run development**: `npm run dev`

## 🛠️ Deployment

- Deploy to **Vercel** for the Edge Proxy features to function correctly.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is added to Vercel Environment Variables.
- Execute SQL artifacts in `/brain/` in your Supabase SQL Editor to initialize schemas and RLS bypasses.

