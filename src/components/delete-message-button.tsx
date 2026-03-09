"use client"

import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteMessage } from "@/app/actions/contact"

export function DeleteMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMessage(id)
      if (!result.success) {
        alert(result.error || "Failed to delete message")
      } else {
        setShowConfirm(false)
        // A toast could go here, but revalidatePath will handle the UI refresh natively
      }
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 p-2 rounded-md border border-red-500/20">
        <span className="text-sm font-medium text-red-400">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
      title="Delete Message"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
