import { PostForm } from "@/components/post-form";

export default function NewPostPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-muted-foreground mt-2">
          Write a new blog post in Markdown format.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
