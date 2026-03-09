import { createClient } from "@/utils/supabase/server";
import { Message } from "@/types";
import { DeleteMessageButton } from "@/components/delete-message-button";

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Exact Supabase Fetch Error:", JSON.stringify(error, null, 2));
  }

  const messageList: Message[] = messages || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground mt-2">
          View all incoming messages from your contact form.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {messageList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messageList.map((msg) => (
              <div key={msg.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-white">{msg.full_name}</h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      {msg.email}
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <DeleteMessageButton id={msg.id} />
                    <time className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>
                
                {msg.subject && (
                  <h4 className="text-sm font-semibold text-white/90 mb-2">Subject: {msg.subject}</h4>
                )}
                
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-md border border-white/5">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
