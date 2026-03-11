import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  
  const { createLog } = await import("@/app/actions/logs");
  await createLog("ADMIN_LOGOUT", "Admin logged out successfully");

  await supabase.auth.signOut();
  
  // Create a response that redirects to home page
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://alfareza.site"), {
    status: 302,
  });
}
