"use client";

import dynamic from "next/dynamic";

const RadarScan = dynamic(() => import("./RadarScan"), { 
  ssr: false,
  loading: () => (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-teal-500/5 animate-pulse flex items-center justify-center border border-teal-500/10">
      <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-teal-500/5 animate-pulse border border-teal-500/10" />
    </div>
  )
});

export function DynamicRadar() {
  return <RadarScan />;
}
