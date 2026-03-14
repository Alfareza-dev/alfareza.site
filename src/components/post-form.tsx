"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types";
import { PurpleButton } from "@/components/purple-button";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [content, setContent] = useState(post?.content || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    
    // Using a fake API call here assuming server actions would be implemented
    // The exact implementation depends on how Supabase client is passed.
    // For this portfolio demo, we'll pretend it succeeds or user has action routes.
    try {
      const res = await fetch("/api/posts", {
        method: post ? "PUT" : "POST",
        body: JSON.stringify({
          id: post?.id,
          title: formData.get("title"),
          slug: formData.get("slug"),
          excerpt: formData.get("excerpt"),
          content: formData.get("content"),
          published: formData.get("published") === "on",
          tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean) : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to save post");
      
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <input
            id="title"
            name="title"
            defaultValue={post?.title}
            required
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
            placeholder="Post Title"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input
            id="slug"
            name="slug"
            defaultValue={post?.slug}
            required
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
            placeholder="post-url-slug"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium">Tags</label>
        <input
          id="tags"
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
          placeholder="Nextjs, Tutorial, RPL"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="excerpt" className="text-sm font-medium">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt || ""}
          className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 resize-none"
          placeholder="Short description of the post..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Content</label>
          <div className="flex bg-white/5 p-1 rounded-md border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "write" ? "bg-teal-600 text-white shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "preview" ? "bg-teal-600 text-white shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        
        <div className="relative min-h-[400px] border border-white/10 rounded-md bg-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "write" ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full bg-transparent p-4 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 font-mono resize-none"
                  placeholder="# Heading 1&#10;Write your markdown here..."
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-y-auto p-4"
              >
                <div className="space-y-6 relative z-10">
                  {content ? (
                    content.split("---").filter(section => section.trim()).map((section, index) => (
                      <div 
                        key={index} 
                        className="group relative p-4 md:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] hover:border-teal-500/30 transition-all duration-500 overflow-hidden"
                      >
                        {/* Subtle purple glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="prose prose-invert prose-teal max-w-none relative z-10 font-sans prose-p:-tracking-tight prose-a:text-[#048092] prose-a:no-underline hover:prose-a:underline prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-teal-400">
                          <ReactMarkdown>{section}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">Nothing to preview</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <input type="hidden" name="content" value={content} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          defaultChecked={post?.published}
          className="rounded border-white/10 bg-white/5 text-teal-600 focus:ring-teal-500"
        />
        <label htmlFor="published" className="text-sm font-medium">
          Publish this post
        </label>
      </div>

      {errorMsg && (
        <div className="text-sm text-red-500 bg-red-500/10 p-3 flex rounded-md border border-red-500/20">{errorMsg}</div>
      )}

      <div className="flex gap-4 pt-4 border-t border-white/10">
        <PurpleButton type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {post ? "Update Post" : "Publish Post"}
        </PurpleButton>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="h-10 px-4 rounded-md border border-white/10 bg-transparent text-sm font-medium hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
