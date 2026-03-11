"use server";

import { createClient } from "@/utils/supabase/server";
import { ContactFormSchema } from "@/types";
import { revalidatePath } from "next/cache";

export async function submitContactForm(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const validatedFields = ContactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      error: "Please fix the errors in the form.",
    };
  }

  const supabase = await createClient();

  // Try to insert only if the Supabase URL config is available
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { error } = await supabase.from("messages").insert({
      full_name: validatedFields.data.full_name,
      email: validatedFields.data.email,
      subject: validatedFields.data.subject,
      content: validatedFields.data.content,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        success: false,
        error: "Failed to send message. Please try again later.",
      };
    }
  } else {
    // Development fallback if Supabase isn't configured yet
    console.log("Mock message successfully sent:", validatedFields.data);
  }

  return {
    success: true,
    message: "Thank you! Your message has been sent successfully.",
  };
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();

  // Validate admin token presence and role
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.user_metadata?.role !== "ADMIN") {
    console.error("Unauthorized access to delete message. Account:", user?.email || "Unknown");
    return { success: false, error: "Unauthorized access" };
  }

  // Get message details for the log before deleting
  const { data: messageToLog } = await supabase
    .from("messages")
    .select("full_name")
    .eq("id", id)
    .single();

  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Exact Supabase Delete Error:", JSON.stringify(deleteError, null, 2));
    return { success: false, error: "Failed to delete message." };
  }

  // Log the deletion
  if (messageToLog) {
    const { createLog } = await import("@/app/actions/logs");
    await createLog("MESSAGE_DELETED", `Deleted message from ${messageToLog.full_name}`);
  }

  revalidatePath("/admin/messages");
  return { success: true };
}
