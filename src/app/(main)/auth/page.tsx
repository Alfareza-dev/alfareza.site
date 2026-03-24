"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      
      const { logFailedLogin } = await import("@/app/actions/logs");
      const blockCheck = await logFailedLogin(email);

      // Instantly trigger Vercel Proxy evaluation intercepting this machine if Banned
      if (blockCheck?.isBanned === true) {
        window.location.reload();
        return; // Break script execution
      }
      setLoading(false);
    } else {
      const { createLog } = await import("@/app/actions/logs");
      await createLog("ADMIN_LOGIN", "Admin logged in successfully", email);

      router.refresh();
      router.push("/admin");
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden items-center justify-center px-4 relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-sm space-y-6 p-8 border border-white/10 rounded-2xl bg-white/[0.02] shadow-2xl backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the dashboard
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
              required
            />
          </div>

          {errorMsg && (
            <div className="text-sm text-red-500">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full h-10 rounded-md bg-zinc-200 text-sm font-bold text-[#1c2438] hover:bg-white disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
