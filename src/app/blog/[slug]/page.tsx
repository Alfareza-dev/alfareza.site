import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Post } from "@/types";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Handle case where Supabase URL is not set (so we don't crash)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: "Blog Post" };
  }

  const { data } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Post Not Found" };

  return {
    title: data.title,
    description: data.excerpt || "A blog post by Alfareza.",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  let post: Post | null = null;
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    
    if (data) post = data;
  }

  // If no Supabase connection or post not found
  if (!post && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    notFound();
  }

  // Fallback for development state without DB
  if (!post) {
    post = {
      id: "demo",
      title: "Sample Blog Post",
      slug: slug,
      content: "# Hello World\nThis is a dummy post since no database is configured.",
      excerpt: "Sample excerpt.",
      published: true,
      tags: ["Demo", "Preview"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return (
    <article className="flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs font-medium rounded-md bg-white/5 border border-white/10 text-[#8b5cf6] font-sans">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div className="space-y-8">
        {post.content.split("---").filter(section => section.trim()).map((section, index) => (
          <div 
            key={index} 
            className="group relative p-4 md:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] hover:border-purple-500/30 transition-all duration-500 overflow-hidden"
          >
            {/* Subtle purple glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="prose prose-invert prose-purple max-w-none relative z-10">
              <ReactMarkdown>{section}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
