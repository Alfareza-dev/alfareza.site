"use client";

import dynamic from "next/dynamic";

const GeopoliticalMap = dynamic(() => import("./GeopoliticalMap"), { 
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-teal-500/5 animate-pulse border border-teal-500/10" />
  )
});

export function DynamicGeopoliticalMap({
  countryThreats,
}: {
  countryThreats: Record<string, number>;
}) {
  return <GeopoliticalMap countryThreats={countryThreats} />;
}
