import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { createLog } = await import("@/app/actions/logs");
  await createLog("ADMIN_LOGOUT", "Admin logged out successfully");

  await supabase.auth.signOut({ scope: 'global' });
  
  // Create a response that redirects to auth page dynamically
  return NextResponse.redirect(new URL("/auth", request.url).toString(), {
    status: 302,
  });
}
