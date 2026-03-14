import { createClient } from "@/utils/supabase/server";
import { Post } from "@/types";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const supabase = await createClient();
  
  let posts: Post[] = [];
  try {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    
    if (data) posts = data;
  } catch (error) {
    console.error("Could not fetch posts", error);
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Thoughts, technical tutorials, and insights about software engineering.
        </p>
      </div>

      {!posts.length ? (
        <div className="text-center p-12 border border-white/10 rounded-xl bg-white/[0.02]">
          <p className="text-muted-foreground">
            No posts available right now. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col p-6 border border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium rounded-md bg-white/5 border border-white/10 text-[#048092] font-sans">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {post.excerpt && (
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="mt-6 flex items-center text-sm font-medium text-teal-400 group-hover:text-teal-300 transition-colors">
                  Read article <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
