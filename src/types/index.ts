import { z } from "zod";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  visibility: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  full_name: string;
  email: string;
  subject?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const ContactFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").optional(),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
