import Link from "next/link";
import { ShieldAlert, Crosshair } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#1c2438] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-hidden">
      {/* Background Cyber Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#d4d4d8]/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-lg md:max-w-2xl relative z-10">
        <div className="rounded-2xl border border-[#d4d4d8]/20 bg-[#1c2438]/80 backdrop-blur-xl shadow-2xl shadow-[#d4d4d8]/10 p-8 sm:p-12 text-center relative overflow-hidden">
          
          {/* Faint Radar Sweep Background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-20 pointer-events-none">
            <div className="w-64 h-64 border border-[#d4d4d8]/30 rounded-full flex items-center justify-center">
              <div className="w-48 h-48 border border-[#d4d4d8]/20 rounded-full flex items-center justify-center">
                 <div className="w-32 h-32 border border-[#d4d4d8]/10 rounded-full flex items-center justify-center">
                    <Crosshair className="w-16 h-16 text-[#d4d4d8]" />
                 </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-[#d4d4d8]/10 border border-[#d4d4d8]/30 p-4 rounded-full shadow-[0_0_20px_rgba(148,163,184,0.3)] inline-block">
                <ShieldAlert className="w-12 h-12 text-[#d4d4d8] opacity-90 animate-pulse" />
              </div>
            </div>
            
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-4"
              style={{
                textShadow: "0 0 20px rgba(148,163,184,0.6), 0 0 40px rgba(148,163,184,0.2)",
              }}
            >
              404 - ACCESS VOID
            </h1>
            
            <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8">
              The coordinates you are looking for do not exist or have been moved beyond the perimeter. Connection cannot be established.
            </p>
            
            <div className="border-t border-[#d4d4d8]/10 pt-8 mt-2">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3.5 rounded-lg font-bold text-sm md:text-base tracking-wide text-white bg-[#d4d4d8]/20 border border-[#d4d4d8]/50 hover:bg-[#d4d4d8]/30 hover:shadow-[0_0_20px_rgba(148,163,184,0.5)] transition-all duration-300 uppercase"
              >
                Return to Command Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
