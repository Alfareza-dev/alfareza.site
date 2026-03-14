import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  published: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PostSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const postData = {
      ...validatedData.data,
      slug: validatedData.data.slug || validatedData.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      author_id: user.id,
    };

    const { error: insertError } = await supabase.from("posts").insert(postData);

    if (insertError) {
      console.error("Exact Supabase Insert Error:", JSON.stringify(insertError, null, 2));
      return NextResponse.json({ error: "Failed to create post", details: insertError }, { status: 500 });
    }

    const { createLog } = await import("@/app/actions/logs");
    await createLog("POST_CREATED", `Created new post: ${validatedData.data.title}`);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // We expect an ID for PUT requests
    if (!body.id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const validatedData = PostSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = {
      ...validatedData.data,
      slug: validatedData.data.slug || validatedData.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    };

    const { error: updateError } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", body.id);

    if (updateError) {
      console.error("Exact Supabase Update Error:", JSON.stringify(updateError, null, 2));
      return NextResponse.json({ error: "Failed to update post", details: updateError }, { status: 500 });
    }

    const { createLog } = await import("@/app/actions/logs");
    await createLog("POST_UPDATED", `Updated post: ${validatedData.data.title}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
