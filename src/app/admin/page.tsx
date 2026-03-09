import { createClient } from "@/utils/supabase/server";
import { Post } from "@/types";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PurpleButton } from "@/components/purple-button";
import { deletePost } from "@/app/actions/posts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Try to fetch posts if connected
  let posts: Post[] = [];
  try {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) posts = data;
  } catch (error) {
    console.error("Could not fetch posts", error);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal blog posts here.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <PurpleButton>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </PurpleButton>
        </Link>
      </div>

      {!posts.length ? (
        <div className="flex flex-col items-center justify-center p-12 border border-white/10 border-dashed rounded-xl bg-white/[0.01]">
          <p className="text-muted-foreground mb-4">No blog posts found.</p>
          <Link href="/admin/posts/new">
            <PurpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Write your first post
            </PurpleButton>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div>
                <h3 className="font-semibold">{post.title}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>{post.published ? "Published" : "Draft"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/admin/posts/${post.id}`}>
                  <button className="p-2 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <button type="submit" className="p-2 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
