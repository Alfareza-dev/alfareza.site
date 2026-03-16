"use client";

import { MapPin, Info } from "lucide-react";

// Convert ISO 3166-1 alpha-2 country code to emoji flag
function countryToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

export default function GeopoliticalMap({
  countryThreats,
}: {
  countryThreats: Record<string, number>;
}) {
  if (Object.keys(countryThreats).length === 0) {
    return (
      <div className="text-center p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p>No geographic threat telemetry captured yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(countryThreats).map(([countryName, threatCount]) => (
        <div
          key={countryName}
          className="flex items-center justify-between bg-red-950/20 border border-red-500/20 rounded-xl p-5 shadow-lg shadow-red-900/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">
                {countryName} {countryToFlag(countryName)}
              </h4>
              <span className="text-xs text-red-400 font-medium uppercase tracking-wider">
                Origin Source
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-500 leading-none">
              {threatCount}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">
              THREATS
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
