"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePost(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();

  // Validate admin token presence
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error("Unauthorized access to delete post");
    return;
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Exact Supabase Delete Error:", JSON.stringify(deleteError, null, 2));
    return;
  }

  revalidatePath("/admin");
}
