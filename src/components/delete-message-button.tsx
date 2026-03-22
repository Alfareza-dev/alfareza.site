"use client"

import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteMessage } from "@/app/actions/contact"
import { toast } from "sonner"

export function DeleteMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMessage(id)
      if (!result?.success) {
        toast.error(result?.error || "Failed to delete message")
        setShowConfirm(false)
      } else {
        setShowConfirm(false)
        toast.success("Message Deleted Successfully")
      }
    })
  }

  return (
    <div className="flex items-center justify-end">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          title="Delete Message"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-2 py-1 text-xs text-muted-foreground hover:text-white rounded bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-2.5 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[60px]"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
          </button>
        </div>
      )}
    </div>
  )
}
