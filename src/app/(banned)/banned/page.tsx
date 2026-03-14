import { headers } from "next/headers";
import { ShieldAlert, Wifi, Lock, Clock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatSafeIP } from "@/lib/security-utils";

export const metadata = {
  title: "Security Alert - Access Denied",
  description: "Your IP has been blacklisted for security violations.",
};

export default async function BannedPage() {
  const headersList = await headers();
  const city = headersList.get("x-vercel-ip-city");
  const country = headersList.get("x-vercel-ip-country");
  const lat = headersList.get("x-vercel-ip-latitude");
  const lon = headersList.get("x-vercel-ip-longitude");
  const rawIp = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "Private Network";
  const sanitizedIp = formatSafeIP(rawIp);

  const locationDisplay = city && country ? `${decodeURIComponent(city)}, ${decodeURIComponent(country)}` : "Local Network / Private IP";
  const coordinates = lat && lon ? `${lat}°, ${lon}°` : null;

  // Query blocked_ips to check if ban is permanent or temporary
  let isPermanent = false;
  const { data: banRecord } = await supabaseAdmin
    .from("blocked_ips")
    .select("expires_at")
    .eq("ip", sanitizedIp)
    .maybeSingle();

  if (banRecord) {
    isPermanent = banRecord.expires_at === null;
  }

  return (
    <div className="fixed inset-0 bg-[#050a0c] z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans overflow-auto">
      {/* Deep teal background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#048092]/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-40 bg-[#048092]/5 blur-3xl rounded-[100%]" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="rounded-2xl border border-[#048092]/20 bg-[#0a1214]/90 backdrop-blur-2xl shadow-2xl shadow-[#048092]/10 p-8 sm:p-14 text-center space-y-8 overflow-hidden relative">

          {/* Radar Scanner */}
          <div className="relative flex items-center justify-center mx-auto w-52 h-52 sm:w-64 sm:h-64">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-[#048092]/10" />
            <div className="absolute inset-[15%] rounded-full border border-[#048092]/15" />
            <div className="absolute inset-[30%] rounded-full border border-[#048092]/20" />
            <div className="absolute inset-[45%] rounded-full border border-[#048092]/25" />

            {/* Cross-hairs */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#048092]/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#048092]/10" />

            {/* Rotating scan line */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent 0deg, transparent 330deg, rgba(4,128,146,0.25) 345deg, rgba(4,128,146,0.5) 355deg, rgba(4,128,146,0.15) 360deg)",
                animation: "radar-spin 3s linear infinite",
              }}
            />

            {/* Pulsing center dot */}
            <div className="absolute inset-[45%] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#048092]/30 animate-ping" />
            </div>
            <div className="relative z-10 bg-[#0a1214] border border-[#048092]/40 p-4 sm:p-5 rounded-full shadow-[0_0_30px_rgba(4,128,146,0.3)]">
              <ShieldAlert className="w-10 h-10 sm:w-14 sm:h-14 text-[#048092]" />
            </div>
          </div>

          {/* Title with neon glow */}
          <div className="space-y-6 relative z-10">
            <h1
              className="text-3xl sm:text-5xl font-black tracking-[-0.05em] text-white"
              style={{
                textShadow: "0 0 20px rgba(4,128,146,0.8), 0 0 40px rgba(4,128,146,0.4), 0 0 80px rgba(4,128,146,0.2)",
              }}
            >
              ACCESS DENIED
            </h1>

            <div className="space-y-5">
              <p className="text-gray-300 font-medium text-base sm:text-lg leading-relaxed">
                Suspicious activity detected from:
              </p>

              {/* Location & IP info - stacked for mobile */}
              <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                <div className="bg-[#048092]/10 border border-[#048092]/20 py-3 px-5 rounded-xl w-full">
                  <p className="text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-1">Location</p>
                  <p className="text-[#048092] font-bold text-sm sm:text-base break-words">{locationDisplay}</p>
                </div>

                <div className="bg-[#048092]/10 border border-[#048092]/20 py-3 px-5 rounded-xl w-full">
                  <p className="text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-1">IP Address</p>
                  <p className="text-[#048092] font-mono font-bold text-sm sm:text-base break-all">{sanitizedIp}</p>
                </div>

                {coordinates && (
                  <div className="bg-[#048092]/10 border border-[#048092]/20 py-3 px-5 rounded-xl w-full">
                    <p className="text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-1">Coordinates</p>
                    <p className="text-[#048092] font-mono font-bold text-sm">{coordinates}</p>
                  </div>
                )}
              </div>

              {/* Dynamic ban message */}
              {isPermanent ? (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-5">
                  <Lock className="w-4 h-4 shrink-0" />
                  <p>This access restriction is <span className="font-bold">permanent</span> due to critical security violations.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-[#048092] text-sm sm:text-base max-w-sm mx-auto leading-relaxed bg-[#048092]/10 border border-[#048092]/20 rounded-xl py-3 px-5">
                  <Clock className="w-4 h-4 shrink-0" />
                  <p>This block will be automatically lifted within <span className="font-semibold">24 hours</span>.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom status badge */}
          <div className="pt-6 mt-4 border-t border-[#048092]/10 relative z-10">
            <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#048092]/80 bg-[#048092]/10 px-5 py-2.5 rounded-full border border-[#048092]/20">
              <Wifi className="w-4 h-4 animate-pulse flex-shrink-0" />
              <span className="truncate">Connection Terminated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar spin keyframe */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
