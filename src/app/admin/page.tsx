import { createClient } from "@/utils/supabase/server";
import { Post } from "@/types";
import Link from "next/link";
import { Plus, Edit, Trash2, Activity } from "lucide-react";
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
    <div className="space-y-12">
      {/* Quick Access Dashboard */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-all group shadow-sm hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Recent Activity
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Monitor administrative actions and security events across your platform.
            </p>
            <Link href="/admin/activity">
              <button className="flex items-center justify-center w-full h-10 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors group-hover:bg-purple-500/10 group-hover:text-purple-300">
                View All Logs
              </button>
            </Link>
          </div>

          <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-all group shadow-sm hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                Quick Post
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Skip the menus and jump straight into writing a brand new blog post.
            </p>
            <Link href="/admin/posts/new">
              <button className="flex items-center justify-center w-full h-10 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors group-hover:bg-purple-500/10 group-hover:text-purple-300">
                Draft New Post
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Management */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
            <p className="text-muted-foreground mt-2">
              Manage your published personal blog posts here.
            </p>
          </div>
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
      </section>
    </div>
  );
}
