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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="flex h-16 items-center px-6 max-w-6xl mx-auto justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg tracking-tight">
              Admin <span className="text-purple-500">Dashboard</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/admin" className="text-muted-foreground hover:text-white transition-colors">Posts</Link>
              <Link href="/admin/messages" className="text-muted-foreground hover:text-white transition-colors">Inbox</Link>
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
