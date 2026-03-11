import { createClient } from "@/utils/supabase/server";
import { Activity, Plus, Trash, Edit, LogIn, LogOut, ShieldAlert } from "lucide-react";

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
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  return `${Math.floor(diffInMonths / 12)} years ago`;
}

export default async function ActivityLogPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch activity logs:", error);
  }

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE")) return <Plus className="w-5 h-5 text-purple-400" />;
    if (action.includes("DELETE")) return <Trash className="w-5 h-5 text-purple-400" />;
    if (action.includes("UPDATE")) return <Edit className="w-5 h-5 text-purple-400" />;
    if (action.includes("LOGIN")) return <LogIn className="w-5 h-5 text-purple-400" />;
    if (action.includes("LOGOUT")) return <LogOut className="w-5 h-5 text-purple-400" />;
    return <Activity className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-500" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor administrative actions and security events.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
        {logs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mb-4 opacity-50 text-purple-500" />
            <p>No activity logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs?.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-4 p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20 shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-purple-300 truncate">
                      {log.action.replace(/_/g, " ")}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-1 rounded-md border border-white/10 shrink-0">
                      {formatDistanceToNowNative(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                    {log.details}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    {log.admin_email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
