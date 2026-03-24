import { createClient } from "@/utils/supabase/server";
import { Message } from "@/types";
import { DeleteMessageButton } from "@/components/delete-message-button";
import { MarkAsReadButton } from "@/components/admin/MarkAsReadButton";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { Mail, MailOpen, Inbox } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Inbox",
};

const PAGE_SIZE = 5;

type FilterType = "all" | "unread" | "read";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const filter: FilterType = (["all", "unread", "read"].includes(params.filter || "") ? params.filter : "all") as FilterType;

  const supabase = await createClient();
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build query with optional filter
  let query = supabase
    .from("messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "unread") {
    query = query.eq("is_read", false);
  } else if (filter === "read") {
    query = query.eq("is_read", true);
  }

  const { data: messages, count, error } = await query;

  // Get unread count for badge (separate lightweight query)
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  if (error) {
    console.error("Exact Supabase Fetch Error:", JSON.stringify(error, null, 2));
  }

  const messageList: Message[] = messages || [];
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const filterTabs: { label: string; value: FilterType; icon: React.ReactNode; badge?: number }[] = [
    { label: "All", value: "all", icon: <Inbox className="w-4 h-4" /> },
    { label: "Unread", value: "unread", icon: <Mail className="w-4 h-4" />, badge: unreadCount || 0 },
    { label: "Read", value: "read", icon: <MailOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-2">
          <span className="p-2 rounded-full hover:bg-zinc-800/50 transition-all cursor-default">
            <Inbox className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-300 shrink-0" />
          </span>
          Inbox
        </h1>
        <p className="text-muted-foreground mt-2">
          View all incoming messages from your contact form.
          {count !== null && <span className="ml-2 text-xs text-brand-primary">({count} messages)</span>}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {filterTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/messages?filter=${tab.value}&page=1`}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              filter === tab.value
                ? "bg-brand-primary/15 border-brand-primary/30 text-brand-primary"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="text-xs bg-zinc-700/50 text-zinc-300 px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                {tab.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {messageList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No messages found.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messageList.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 transition-colors hover:bg-white/[0.02] relative ${
                  !msg.is_read ? "border-l-2 border-l-brand-primary" : ""
                }`}
              >
                {/* Unread glow indicator */}
                {!msg.is_read && (
                  <div className="absolute top-6 left-4 w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}

                <div className={`flex justify-between items-start gap-4 mb-4 ${!msg.is_read ? "pl-4" : ""}`}>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${!msg.is_read ? "text-white font-semibold" : "text-white/70"}`}>
                      {msg.full_name}
                    </h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-zinc-300 hover:text-white transition-colors underline-offset-4 hover:underline truncate block">
                      {msg.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <MarkAsReadButton messageId={msg.id} isRead={msg.is_read} />
                    <DeleteMessageButton id={msg.id} />
                  </div>
                </div>

                <div className={`${!msg.is_read ? "pl-4" : ""}`}>
                  {msg.subject && (
                    <h4 className="text-sm font-semibold text-white/90 mb-2">Subject: {msg.subject}</h4>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words bg-white/5 p-4 rounded-md border border-white/5">
                    {msg.content}
                  </p>

                  <time className="text-xs text-gray-500 mt-3 block">
                    {new Date(msg.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/messages"
        extraParams={{ filter }}
      />
    </div>
  );
}
