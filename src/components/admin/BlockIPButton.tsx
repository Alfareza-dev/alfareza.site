"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { blockIPAddress } from "@/app/actions/logs";
import { useRouter } from "next/navigation";

export function BlockIPButton({ ip, initiallyBlocked = false }: { ip: string, initiallyBlocked?: boolean }) {
  const [isBlocked, setIsBlocked] = useState(initiallyBlocked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleBlock() {
    if (isBlocked) return;
    setIsLoading(true);
    try {
      const res = await blockIPAddress(ip);
      if (res.success) {
        setIsBlocked(true);
        router.refresh();
      } else {
        console.error("Failed to block IP:", res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isBlocked) {
    return (
      <button 
        disabled 
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/10 text-muted-foreground cursor-not-allowed shrink-0"
      >
        <Ban className="w-4 h-4" />
        Blocked
      </button>
    );
  }

  return (
    <button 
      onClick={handleBlock}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Ban className="w-4 h-4" />
      {isLoading ? "Blocking..." : "Block IP"}
    </button>
  );
}
