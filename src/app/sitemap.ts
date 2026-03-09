import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alfareza.site";

  // Init blank entries for dynamic blog
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    
    // Select strictly published posts mapping required SEO metadata
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, updated_at, created_at")
      .eq("published", true);

    if (error) {
      console.error("Supabase sitemap fetch error:", error);
    } else if (posts) {
      blogEntries = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at).toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Critical error building dynamic sitemap:", err);
  }

  // Define the core static application maps
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...blogEntries];
}
