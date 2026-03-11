import { createClient } from "@/utils/supabase/server";
import { Shield, ShieldAlert, MapPin, Ghost, Info, Globe, AlertTriangle } from "lucide-react";
import { BlockIPButton } from "@/components/admin/BlockIPButton";
import { formatSafeIP } from "@/lib/security-utils";
import { RelativeTime } from "@/components/admin/RelativeTime";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { ClientMountedWrapper } from "@/components/admin/ClientMountedWrapper";

export const dynamic = "force-dynamic";

export default async function SecurityDashboard() {
  const supabase = await createClient();

  // Fetch failed logins, critical alerts, honeypots, and extract geodata metrics
  const { data: alerts, error } = await supabase
    .from("activity_logs")
    .select("*, country, city, isp")
    .in("action", ["LOGIN_FAILURE", "SECURITY_ALERT_CRITICAL", "HONEYPOT_TRIGGERED"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch security logs:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-bold text-white">Database Sync Error</h1>
        <p className="text-muted-foreground text-red-300">
          Failed to synchronize with Supabase Security Logs. Please check the Vercel connection.
        </p>
      </div>
    );
  }

  // Extract IP utility for the UI
  const extractIP = (details: string) => {
    const match = details.match(/IP: ([\d\.:a-fA-F]+)/);
    return formatSafeIP(match ? match[1] : "Unknown");
  };

  // Fetch blocked IPs to know initial state precisely with Service Role bypass
  const supabaseAdmin = (await import("@/lib/supabaseAdmin")).supabaseAdmin;
  const { data: blockedList } = await supabaseAdmin
    .from("blocked_ips")
    .select("ip");
  const blockedIps = new Set(blockedList?.map(b => b.ip));

  return (
    <div className="space-y-8 font-sans">
      <AutoRefresh intervalSeconds={30} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Security Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage unauthorized access attempts.
          </p>
        </div>
      </div>

      <ClientMountedWrapper skeleton={
        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border border-white/10 rounded-xl bg-black/50">
          <ShieldAlert className="w-12 h-12 mb-4 opacity-50 text-red-500 animate-pulse" />
          <p>Decrypting and verifying live security feeds...</p>
        </div>
      }>
        <div className="rounded-xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl p-6">
          {alerts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground w-full">
              <Shield className="w-12 h-12 mb-4 opacity-50 text-purple-500" />
              <p>No security threats detected. Your system is safe.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {alerts?.map((alert) => {
                const isCritical = alert.action === "SECURITY_ALERT_CRITICAL";
                const isHoneypot = alert.action === "HONEYPOT_TRIGGERED";
                const ip = extractIP(alert.details);
                const initiallyBlocked = blockedIps.has(ip);
                
                return (
                  <div 
                    key={alert.id} 
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl border transition-colors ${
                      isHoneypot
                        ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30'
                        : isCritical 
                          ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' 
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full shrink-0 border ${
                        isHoneypot
                          ? 'bg-red-500/20 border-red-500/30 text-red-500'
                          : isCritical 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {isHoneypot ? <Ghost className="w-5 h-5" /> : isCritical ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-semibold ${isHoneypot ? 'text-red-500 font-bold tracking-wide' : isCritical ? 'text-red-400' : 'text-purple-300'}`}>
                            {isHoneypot ? 'HONEYPOT TRIGGERED' : isCritical ? 'CRITICAL ALERT' : 'Failed Login Attempt'}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md border border-white/10">
                            <RelativeTime date={alert.created_at} />
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2 font-mono text-xs">
                          {alert.details}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                          {alert.country ? (
                            <span className="flex items-center gap-1.5 opacity-80 font-medium text-cyan-400">
                              <MapPin className="w-3.5 h-3.5" />
                              {alert.city}, {alert.country}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 opacity-80 font-mono text-cyan-600 border border-cyan-800/30 bg-cyan-950/20 px-1.5 py-0.5 rounded">
                              <MapPin className="w-3.5 h-3.5" />
                              VERCEL_EDGE_BYPASS // LOCAL_NET
                            </span>
                          )}
                          <span className={`font-mono px-2 py-0.5 rounded ${
                            isHoneypot 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                              : isCritical 
                                ? 'bg-red-500/10 text-red-300' 
                                : 'bg-purple-500/10 text-purple-300'
                          }`}>
                            {ip}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <BlockIPButton ip={ip} initiallyBlocked={initiallyBlocked} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* ATTACK ORIGIN MAP SECTION */}
      <div className="pt-8 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Geopolitical Attack Origin</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Live geofencing tracking active threats mapped to their geographic network sources.
        </p>

        {alerts?.filter(a => a.country).length === 0 ? (
            <div className="text-center p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p>No geographic threat telemetry captured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* De-duplicate countries for summary view */}
              {Array.from(new Set(alerts?.filter(a => a.country).map(a => a.country))).map(countryName => {
                const threatCount = alerts?.filter(a => a.country === countryName).length;
                return (
                  <div key={countryName} className="flex items-center justify-between bg-red-950/20 border border-red-500/20 rounded-xl p-5 shadow-lg shadow-red-900/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{countryName}</h4>
                        <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Origin Source</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-red-500 leading-none">{threatCount}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">THREATS</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      <div className="pt-8 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Ghost className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Honeypot Hall of Shame</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          A definitive log of all automated bots, scrapers, and malicious entities permanently captured by our hidden Honeypot systems.
        </p>

        {alerts?.filter(a => a.action === "HONEYPOT_TRIGGERED").length === 0 ? (
            <div className="text-center p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p>No bots captured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts?.filter(a => a.action === "HONEYPOT_TRIGGERED").map((bot) => {
                const ip = extractIP(bot.details);
                // Regex fallback if agent formatting changes
                const agentMatch = bot.details.match(/User-Agent: (.*)/);
                const userAgent = agentMatch ? agentMatch[1] : "Unknown Agent";

                return (
                  <div key={bot.id} className="bg-red-950/20 border border-red-500/20 rounded-xl p-5 hover:bg-red-950/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-mono text-sm px-2 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
                        {ip}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <RelativeTime date={bot.created_at} />
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">User-Agent Signature</h4>
                      <p className="text-xs font-mono text-gray-300 break-words bg-black/40 p-2 rounded border border-white/5">
                        {userAgent}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
      </ClientMountedWrapper>
    </div>
  );
}
