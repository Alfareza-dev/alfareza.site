import { ShieldBan, AlertOctagon } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Access Denied | Alfareza",
  description: "Your access has been restricted due to security violations.",
};

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        <div className="rounded-2xl border border-red-500/20 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl shadow-red-500/10 p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <div className="bg-[#0c0c0c] border border-red-500/30 p-5 rounded-full relative z-10">
              <ShieldBan className="w-16 h-16 text-red-500" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              Access Restricted
            </h1>
            <p className="text-lg text-red-500 font-bold tracking-wide">
              IP Anda telah diblokir secara otomatis karena terindikasi aktivitas spam/mencurigakan.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4 font-medium">
              Blokir akan terbuka otomatis dalam 24 jam. Jika Anda merasa ini adalah kesalahan, silakan coba lagi setelah masa penangguhan berakhir.
            </p>
          </div>

          <div className="pt-8 border-t border-red-500/10 relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-400/90 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              <AlertOctagon className="w-4 h-4" />
              This block is actively monitored and logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
