"use client";

import { ShieldAlert } from "lucide-react";

export default function RadarScan() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-64 lg:h-64">
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
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 330deg, rgba(4,128,146,0.25) 345deg, rgba(4,128,146,0.5) 355deg, rgba(4,128,146,0.15) 360deg)",
          animation: "radar-spin 3s linear infinite",
        }}
      />

      {/* Pulsing center dot */}
      <div className="absolute inset-[45%] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#048092]/30 animate-ping" />
      </div>
      <div className="relative z-10 bg-[#0a1214] border border-[#048092]/40 p-3 sm:p-4 md:p-5 rounded-full shadow-[0_0_30px_rgba(4,128,146,0.3)]">
        <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-[#048092]" />
      </div>
    </div>
  );
}
