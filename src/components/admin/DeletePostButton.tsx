"use client"

import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deletePost } from "@/app/actions/posts"
import { toast } from "sonner"

export function DeletePostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(id)
      if (!result?.success) {
        toast.error(result?.error || "Failed to delete post")
        setShowConfirm(false)
      } else {
        setShowConfirm(false)
        toast.success("Post Deleted Successfully")
      }
    })
  }

  return (
    <div className="flex items-center">
      <button
        onClick={() => setShowConfirm(!showConfirm)}
        disabled={isPending}
        className={`p-2 rounded-md transition-colors border ${
          showConfirm 
            ? "text-red-500 bg-red-500/10 border-red-500/20" 
            : "text-muted-foreground hover:text-red-400 hover:bg-white/10 border-white/5"
        }`}
        title="Delete Post"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
          showConfirm ? "w-[72px] opacity-100 ml-2" : "w-0 opacity-0 ml-0"
        }`}
      >
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center justify-center w-full px-2 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
        </button>
      </div>
    </div>
  )
}
