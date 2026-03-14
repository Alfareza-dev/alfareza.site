import { createClient } from "@/utils/supabase/server";
import { Activity, Plus, Trash, Edit, LogIn, LogOut, ShieldAlert } from "lucide-react";
import { PaginationControls } from "@/components/admin/PaginationControls";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

function formatWIB(dateString: string): string {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
  return formatter.format(date) + " WIB";
}

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: logs, count, error } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch activity logs:", error);
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE")) return <Plus className="w-5 h-5 text-teal-400" />;
    if (action.includes("DELETE")) return <Trash className="w-5 h-5 text-teal-400" />;
    if (action.includes("UPDATE")) return <Edit className="w-5 h-5 text-teal-400" />;
    if (action.includes("LOGIN")) return <LogIn className="w-5 h-5 text-teal-400" />;
    if (action.includes("LOGOUT")) return <LogOut className="w-5 h-5 text-teal-400" />;
    return <Activity className="w-5 h-5 text-teal-400" />;
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-500" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor administrative actions and security events.
            {count !== null && <span className="ml-2 text-xs text-teal-400">({count} total entries)</span>}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-teal-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
        {logs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mb-4 opacity-50 text-teal-500" />
            <p>No activity logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs?.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-4 p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="p-3 rounded-full bg-teal-500/10 border border-teal-500/20 shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-teal-300 truncate">
                      {log.action.replace(/_/g, " ")}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-1 rounded-md border border-white/10 shrink-0">
                      {formatWIB(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                    {log.details}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    {log.admin_email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/activity"
      />
    </div>
  );
}
