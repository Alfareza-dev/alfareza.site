import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";

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
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden">
      <AdminHeader
        userEmail={data.user.email || ""}
        hasCriticalAlert={!!hasCriticalAlert}
      />
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
