import { createClient } from "@/utils/supabase/server";
import { Users, ShieldCheck, Clock, FileText, ScanEye } from "lucide-react";
import Link from "next/link";
import { RelativeTime } from "@/components/admin/RelativeTime";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  const supabase = await createClient();

  const supabaseAdmin = (await import("@/lib/supabaseAdmin")).supabaseAdmin;

  // 1. Visitor Stats (using supabaseAdmin to bypass RLS)
  const [{ count: totalVisits }, uniqueVisitorsResponse] = await Promise.all([
    supabaseAdmin.from("visitor_stats").select("*", { count: "exact", head: true }),
    supabase.rpc("get_unique_visitor_count")
  ]);
  
  // Safely fallback for unique visitors querying if RPC isn't built yet
  let uniqueVisitCount = uniqueVisitorsResponse?.count || 0;
  if (!uniqueVisitCount) {
    const { data: uniqueIPs } = await supabaseAdmin.from("visitor_stats").select("ip_address");
    const ipSet = new Set(uniqueIPs?.map((v) => v.ip_address));
    uniqueVisitCount = ipSet.size;
  }

  // 2. Security Health
  const [{ count: criticalAlerts }, { count: blockedIPs }] = await Promise.all([
    supabase.from("activity_logs").select("*", { count: "exact", head: true }).eq("action", "SECURITY_ALERT_CRITICAL"),
    supabaseAdmin.from("blocked_ips").select("*", { count: "exact", head: true })
  ]);

  // 3. Last Login
  const { data: lastLoginLogs } = await supabase
    .from("activity_logs")
    .select("created_at")
    .eq("action", "ADMIN_LOGIN")
    .order("created_at", { ascending: false })
    .limit(1);

  const hasLogs = lastLoginLogs && lastLoginLogs.length > 0;

  return (
    <div className="space-y-8 font-sans">
      <AutoRefresh intervalSeconds={30} />
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
          <p className="text-muted-foreground mt-2">
            Overview of platform performance, security health, and essential metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Visitor Stats */}
        <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <Users className="w-16 h-16 text-cyan-500" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Traffic</h2>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-white">{totalVisits || 0}</span>
            <span className="text-sm text-muted-foreground mb-1 leading-relaxed">Total Visits</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-cyan-400 mt-4">
            <ScanEye className="w-4 h-4" />
            <span className="font-medium">{uniqueVisitCount}</span> Unique Visitors (by IP)
          </div>
        </div>

        {/* Security Health */}
        <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <ShieldCheck className="w-16 h-16 text-purple-500" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security</h2>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-white">{blockedIPs || 0}</span>
            <span className="text-sm text-muted-foreground mb-1 leading-relaxed">Banned IPs</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-400 mt-4">
            <span className="flex h-2 w-2 relative">
              {(criticalAlerts || 0) > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-medium">{criticalAlerts || 0}</span> Critical Alerts
          </div>
        </div>

        {/* Last Login */}
        <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <Clock className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Access</h2>
          <div className="flex flex-col mt-4">
            <span className="text-2xl font-bold text-white mb-1">
              {hasLogs ? <RelativeTime date={lastLoginLogs[0].created_at} /> : "No recent logs"}
            </span>
            <span className="text-sm text-muted-foreground">Last Successful Admin Login</span>
          </div>
          <div className="mt-6">
            <Link href="/admin/activity" className="text-xs font-semibold uppercase tracking-wider text-purple-400 hover:text-purple-300">
              View Access Logs &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Link href="/admin/posts/new">
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Draft New Post</h3>
              <p className="text-sm text-muted-foreground">Quick jump to the blog editor</p>
            </div>
          </div>
        </Link>
        
        <Link href="/admin/security">
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Review Security Alerts</h3>
              <p className="text-sm text-muted-foreground">Manage IPs and analyze threats</p>
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
