import { createClient } from "@supabase/supabase-js";

// Ensure this is only used in Server Components or Server Actions
if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin should only be used on the server side");
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
