import { headers } from "next/headers";
import { ShieldAlert, Wifi, Lock, Clock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatSafeIP } from "@/lib/security-utils";
import { DynamicRadar } from "@/components/banned/DynamicRadar";

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
    <div className="fixed inset-0 bg-[#050a0c] z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 font-sans overflow-hidden">
      {/* Deep teal background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-[#048092]/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-40 bg-[#048092]/5 blur-3xl rounded-[100%]" />
      </div>

      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl relative z-10">
        <div className="rounded-2xl border border-[#048092]/20 bg-[#0a1214]/90 backdrop-blur-2xl shadow-2xl shadow-[#048092]/10 p-5 sm:p-6 md:p-10 lg:p-14 overflow-hidden relative">

          {/* Main content: stacked on mobile, side-by-side on md+ */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-10 lg:gap-14">

            {/* Left: Radar Scanner */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <DynamicRadar />
            </div>

            {/* Right: Content */}
            <div className="flex-1 mt-6 md:mt-0 text-center md:text-left space-y-5 md:space-y-6 relative z-10">
              {/* Title with neon glow */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.05em] text-white"
                style={{
                  textShadow: "0 0 20px rgba(4,128,146,0.8), 0 0 40px rgba(4,128,146,0.4), 0 0 80px rgba(4,128,146,0.2)",
                }}
              >
                ACCESS DENIED
              </h1>

              <p className="text-gray-300 font-medium text-sm sm:text-base md:text-lg leading-relaxed">
                Suspicious activity detected from:
              </p>

              {/* Info cards — responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                <div className="bg-[#048092]/10 border border-[#048092]/20 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl w-full">
                  <p className="text-[10px] sm:text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-0.5 sm:mb-1">Location</p>
                  <p className="text-[#048092] font-bold text-xs sm:text-sm md:text-base break-words">{locationDisplay}</p>
                </div>

                <div className="bg-[#048092]/10 border border-[#048092]/20 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl w-full">
                  <p className="text-[10px] sm:text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-0.5 sm:mb-1">IP Address</p>
                  <p className="text-[#048092] font-mono font-bold text-xs sm:text-sm md:text-base break-all">{sanitizedIp}</p>
                </div>

                {coordinates && (
                  <div className="bg-[#048092]/10 border border-[#048092]/20 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl w-full sm:col-span-2 md:col-span-1">
                    <p className="text-[10px] sm:text-xs text-[#048092]/70 uppercase tracking-widest font-semibold mb-0.5 sm:mb-1">Coordinates</p>
                    <p className="text-[#048092] font-mono font-bold text-xs sm:text-sm">{coordinates}</p>
                  </div>
                )}
              </div>

              {/* Dynamic ban message */}
              {isPermanent ? (
                <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm md:text-base leading-relaxed bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-4 sm:py-3 sm:px-5 justify-center md:justify-start">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <p>This access restriction is <span className="font-bold">permanent</span> due to critical security violations.</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#048092] text-xs sm:text-sm md:text-base leading-relaxed bg-[#048092]/10 border border-[#048092]/20 rounded-xl py-2.5 px-4 sm:py-3 sm:px-5 justify-center md:justify-start">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <p>This block will be automatically lifted within <span className="font-semibold">24 hours</span>.</p>
                </div>
              )}

              {/* Bottom status badge */}
              <div className="pt-4 sm:pt-6 mt-2 sm:mt-4 border-t border-[#048092]/10">
                <div className="inline-flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase text-[#048092]/80 bg-[#048092]/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#048092]/20">
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" />
                  <span className="truncate">Connection Terminated</span>
                </div>
              </div>
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
