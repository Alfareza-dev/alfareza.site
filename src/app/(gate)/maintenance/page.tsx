import { Settings, Wifi } from "lucide-react";

export const metadata = {
  title: "System Maintenance",
  description: "We are currently fine-tuning our systems.",
};

export default function MaintenancePage() {
  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] bg-[#1c2438] z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
      {/* Deep indigo background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4d4d8]/8 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="rounded-2xl border border-[#d4d4d8]/20 bg-[#1c2438]/90 backdrop-blur-2xl shadow-2xl shadow-[#d4d4d8]/10 p-8 sm:p-14 text-center space-y-8 overflow-hidden relative">

          {/* Animated Gear System */}
          <div className="relative flex items-center justify-center mx-auto w-52 h-52 sm:w-64 sm:h-64">
            {/* Outer ring — slow rotation */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#d4d4d8]/20"
              style={{ animation: "gear-spin 12s linear infinite" }}
            />
            {/* Middle ring — medium rotation reversed */}
            <div
              className="absolute inset-[18%] rounded-full border-2 border-dashed border-[#d4d4d8]/25"
              style={{ animation: "gear-spin-reverse 8s linear infinite" }}
            />
            {/* Inner ring — fast rotation */}
            <div
              className="absolute inset-[36%] rounded-full border-2 border-dashed border-[#d4d4d8]/30"
              style={{ animation: "gear-spin 5s linear infinite" }}
            />

            {/* Circuit decoration lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#d4d4d8]/8" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#d4d4d8]/8" />
            <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[#d4d4d8]/5" />
            <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[#d4d4d8]/5" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-[#d4d4d8]/5" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-[#d4d4d8]/5" />

            {/* Pulsing dots at intersections */}
            <div className="absolute top-[25%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#d4d4d8]/40 animate-pulse" />
            <div className="absolute top-[25%] left-[75%] w-1.5 h-1.5 rounded-full bg-[#d4d4d8]/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-[75%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#d4d4d8]/40 animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-[75%] left-[75%] w-1.5 h-1.5 rounded-full bg-[#d4d4d8]/40 animate-pulse" style={{ animationDelay: "1.5s" }} />

            {/* Center icon */}
            <div className="relative z-10 bg-[#1c2438] border border-[#d4d4d8]/40 p-5 sm:p-6 rounded-full shadow-[0_0_30px_rgba(212,212,216,0.3)]">
              <Settings
                className="w-10 h-10 sm:w-14 sm:h-14 text-[#d4d4d8]"
                style={{ animation: "gear-spin 4s linear infinite" }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-6 relative z-10">
            <h1
              className="text-2xl sm:text-4xl font-black tracking-[-0.03em] text-white"
              style={{
                textShadow: "0 0 20px rgba(212,212,216,0.6), 0 0 40px rgba(212,212,216,0.3)",
              }}
            >
              SYSTEM OPTIMIZATION
            </h1>
            <p className="text-[#d4d4d8] text-sm sm:text-base font-semibold uppercase tracking-[0.2em]">
              In Progress
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We are currently fine-tuning our systems to provide you with a better experience. We&apos;ll be back shortly.
              </p>

              {/* Progress bar animation */}
              <div className="w-full max-w-xs mx-auto h-1 bg-[#d4d4d8]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d4d4d8]/60 rounded-full"
                  style={{
                    animation: "progress-sweep 2.5s ease-in-out infinite",
                  }}
                />
              </div>

              <p className="text-gray-500 text-xs">
                All services will resume automatically once optimization is complete.
              </p>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="pt-6 mt-4 border-t border-[#d4d4d8]/10 relative z-10">
            <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#d4d4d8]/80 bg-[#d4d4d8]/10 px-5 py-2.5 rounded-full border border-[#d4d4d8]/20">
              <Wifi className="w-4 h-4 animate-pulse flex-shrink-0" />
              <span className="truncate">Scheduled Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gear-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gear-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes progress-sweep {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}} />
    </div>
  );
}
