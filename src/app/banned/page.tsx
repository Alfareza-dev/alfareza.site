import { headers } from "next/headers";
import { ShieldAlert, AlertOctagon } from "lucide-react";

export const metadata = {
  title: "Security Alert - Access Denied",
  description: "Your IP has been blacklisted for security violations.",
};

export default async function BannedPage() {
  const headersList = await headers();
  const city = headersList.get("x-vercel-ip-city");
  const country = headersList.get("x-vercel-ip-country");
  const realIp = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "Local Network / Private IP";

  const locationDisplay = city && country ? `${city}, ${country}` : "Local Network / Private IP";

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-red-900/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="rounded-2xl border border-red-600/30 bg-black/80 backdrop-blur-2xl shadow-2xl shadow-red-900/40 p-10 sm:p-14 text-center space-y-10 overflow-hidden relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-red-600/20 blur-3xl pointer-events-none rounded-[100%]" />
          
          <div className="relative inline-flex mb-2">
            <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full animate-pulse flex-shrink-0" />
            <div className="bg-black border border-red-500/50 p-6 rounded-full relative z-10">
              <ShieldAlert className="w-20 h-20 text-red-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] font-roboto">
              ACCESS DENIED
            </h1>
            
            <div className="space-y-6 text-xl">
              <p className="text-gray-300 font-medium">
                Our system detected suspicious activity from: <span className="text-red-500 font-bold tracking-wide">{locationDisplay}</span>.
              </p>
              
              <div className="bg-red-950/30 border border-red-900/50 py-4 px-6 rounded-xl inline-block mx-auto">
                <p className="text-gray-300">
                  Your IP address (<span className="text-red-500 font-mono font-bold tracking-wider">{realIp}</span>) has been added to our automatic blacklist.
                </p>
              </div>

              <p className="text-red-400 font-semibold text-lg max-w-lg mx-auto leading-relaxed">
                This block will be automatically unblocked in the next 24 hours.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-10 border-t border-red-800/30 relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase text-red-500/90 bg-red-950/40 px-6 py-3 rounded-full border border-red-900/50">
              <AlertOctagon className="w-5 h-5 flex-shrink-0" />
              Connection actively terminated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
