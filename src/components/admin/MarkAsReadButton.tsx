"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { markAsRead } from "@/app/actions/logs";
import { useRouter } from "next/navigation";

export function MarkAsReadButton({ messageId, isRead }: { messageId: string; isRead: boolean }) {
  const [done, setDone] = useState(isRead);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-teal-400 opacity-70">
        <Check className="w-3.5 h-3.5" /> Read
      </span>
    );
  }

  async function handleMarkRead() {
    setIsLoading(true);
    try {
      const res = await markAsRead(messageId);
      if (res.success) {
        setDone(true);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkRead}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Mark as read"
    >
      <Check className="w-3.5 h-3.5" />
      {isLoading ? "..." : "Mark Read"}
    </button>
  );
}
