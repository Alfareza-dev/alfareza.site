import { PostForm } from "@/components/post-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Post } from "@/types";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let post: Post | null = null;
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();
    if (data) post = data;
  }

  if (!post && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <p className="text-muted-foreground mt-2">
          Update your blog post content and manage publication status.
        </p>
      </div>
      <PostForm post={post || undefined} />
    </div>
  );
}
