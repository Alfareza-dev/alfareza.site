import { createClient } from "@/utils/supabase/server";
import { Shield, ShieldAlert, Ban, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDistanceToNowNative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInDays} days ago`;
  return `${Math.floor(diffInMonths / 12)} years ago`;
}

export default async function SecurityDashboard() {
  const supabase = await createClient();

  // Fetch only failed logins and critical alerts
  const { data: alerts, error } = await supabase
    .from("activity_logs")
    .select("*")
    .in("action", ["LOGIN_FAILURE", "SECURITY_ALERT_CRITICAL"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch security logs:", error);
  }

  // Extract IP utility for the UI
  const extractIP = (details: string) => {
    const match = details.match(/IP: ([\d\.:a-fA-F]+)/);
    return match ? match[1] : "Unknown";
  };

  return (
    <div className="space-y-8 font-sans">
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

      <div className="rounded-xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl overflow-hidden shadow-2xl">
        {alerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Shield className="w-12 h-12 mb-4 opacity-50 text-purple-500" />
            <p>No security threats detected. Your system is safe.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts?.map((alert) => {
              const isCritical = alert.action === "SECURITY_ALERT_CRITICAL";
              const ip = extractIP(alert.details);
              
              return (
                <div 
                  key={alert.id} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 transition-colors ${
                    isCritical ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full shrink-0 border ${
                      isCritical ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                      {isCritical ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${isCritical ? 'text-red-400' : 'text-purple-300'}`}>
                          {isCritical ? 'CRITICAL ALERT' : 'Failed Login Attempt'}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md border border-white/10">
                          {formatDistanceToNowNative(alert.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {alert.details}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 opacity-80">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                          Location tracking pending
                        </span>
                        <span className={`font-mono px-1.5 py-0.5 rounded ${isCritical ? 'bg-red-500/10 text-red-300' : 'bg-purple-500/10 text-purple-300'}`}>
                          {ip}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all shrink-0">
                    <Ban className="w-4 h-4" />
                    Block IP
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
