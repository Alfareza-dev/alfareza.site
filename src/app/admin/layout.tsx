import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth");
  }

  // Second layer of defense: Verify user is the Owner
  if (data.user.email !== "alfareza.dev@gmail.com") {
    console.error("Access Denied: Attempted unauthorized access to Admin Dashboard by:", data.user.email);
    redirect("/");
  }

  // Check for critical security alerts in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: criticalLogs } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("action", "SECURITY_ALERT_CRITICAL")
    .gte("created_at", oneDayAgo)
    .limit(1);

  const hasCriticalAlert = criticalLogs && criticalLogs.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="flex h-16 items-center px-6 max-w-6xl mx-auto justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg tracking-tight">
              Admin <span className="text-purple-500">Dashboard</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/admin" className="text-muted-foreground hover:text-white transition-colors">Dashboard</Link>
              <Link href="/admin/posts" className="text-muted-foreground hover:text-white transition-colors">Posts</Link>
              <Link href="/admin/messages" className="text-muted-foreground hover:text-white transition-colors">Inbox</Link>
              <Link href="/admin/activity" className="text-muted-foreground hover:text-white transition-colors">Activity</Link>
              <Link href="/admin/security" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 relative">
                Security
                {hasCriticalAlert && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank" 
              className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-white text-muted-foreground h-9 px-3 border border-white/10 bg-white/5"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Site
            </Link>
            <span className="hidden md:inline-block text-sm text-muted-foreground ml-4">
              {data.user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-white text-muted-foreground h-9 px-3">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
