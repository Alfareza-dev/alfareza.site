"use client";

import { useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { blockIPAddress, unblockIPAddress } from "@/app/actions/logs";
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

  async function handleUnblock() {
    if (!isBlocked) return;
    setIsLoading(true);
    try {
      const res = await unblockIPAddress(ip);
      if (res.success) {
        setIsBlocked(false);
        router.refresh();
      } else {
        console.error("Failed to unblock IP:", res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          <Ban className="w-3.5 h-3.5" />
          Blocked
        </span>
        <button 
          onClick={handleUnblock}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-white/5 border border-white/10 hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {isLoading ? "..." : "Unblock"}
        </button>
      </div>
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
