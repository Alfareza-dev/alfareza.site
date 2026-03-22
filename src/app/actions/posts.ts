"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePost(id: string) {
  if (!id) return { success: false, error: "Invalid post ID" };

  const supabase = await createClient();

  // Validate super admin token
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== "alfareza.dev@gmail.com") {
    console.error("Unauthorized access to delete post. Account:", user?.email || "Unknown");
    return { success: false, error: "Unauthorized access: Super Admin only" };
  }

  const { supabaseAdmin } = await import("@/lib/supabaseAdmin");

  // Get post details for the log
  const { data: postToLog } = await supabase
    .from("posts")
    .select("title")
    .eq("id", id)
    .single();

  const { error: deleteError } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Exact Supabase Delete Error:", JSON.stringify(deleteError, null, 2));
    return { success: false, error: "Failed to delete post." };
  }

  // Log the deletion
  if (postToLog) {
    const { createLog } = await import("@/app/actions/logs");
    await createLog("POST_DELETED", `Deleted post: ${postToLog.title}`);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  return { success: true };
}
