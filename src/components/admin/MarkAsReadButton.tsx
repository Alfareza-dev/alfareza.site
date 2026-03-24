"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { markAsRead } from "@/app/actions/logs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MarkAsReadButton({ messageId, isRead }: { messageId: string; isRead: boolean }) {
  const [done, setDone] = useState(isRead);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-brand-primary opacity-70">
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
        toast.success("Message marked as read");
        router.refresh();
      } else {
        toast.error("Failed to mark message as read");
      }
    } catch (e) {
      toast.error("Error marking message as read");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkRead}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-brand-primary/20 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 hover:border-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Mark as read"
    >
      <Check className="w-3.5 h-3.5" />
      {isLoading ? "..." : "Mark Read"}
    </button>
  );
}
