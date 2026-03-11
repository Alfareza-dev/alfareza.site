"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePost(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();

  // Validate admin token presence and role
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.user_metadata?.role !== "ADMIN") {
    console.error("Unauthorized access to delete post. Account:", user?.email || "Unknown");
    return;
  }

  // Get post details for the log
  const { data: postToLog } = await supabase
    .from("posts")
    .select("title")
    .eq("id", id)
    .single();

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Exact Supabase Delete Error:", JSON.stringify(deleteError, null, 2));
    return;
  }

  // Log the deletion
  if (postToLog) {
    const { createLog } = await import("@/app/actions/logs");
    await createLog("POST_DELETED", `Deleted post: ${postToLog.title}`);
  }

  revalidatePath("/admin");
}
