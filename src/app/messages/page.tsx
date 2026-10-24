import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getConversations } from "@/lib/messages";

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await getConversations(user.id);

  return (
    <div className="container-page flex max-w-2xl flex-col gap-4 py-8">
      <h1 className="text-xl font-bold text-foreground">Messages</h1>
      {conversations.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <MessageCircle size={28} className="text-muted" />
          <p className="text-sm text-muted">No conversations yet. Message a seller from any product page.</p>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {conversations.map((c) => (
            <Link key={c.partnerId} href={`/messages/${c.partnerId}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-muted">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{c.partnerName}</p>
                <p className="truncate text-xs text-muted">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && <span className="badge badge-blue shrink-0">{c.unread} new</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
