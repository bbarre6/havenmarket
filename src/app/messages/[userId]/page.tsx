import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserForPage } from "@/lib/auth-helpers";
import { getThread } from "@/lib/messages";
import MessageThread from "@/components/MessageThread";

export default async function MessageThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: partnerId } = await params;
  const user = await requireUserForPage(`/messages/${partnerId}`);

  const partner = await prisma.user.findUnique({ where: { id: partnerId }, select: { id: true, name: true } });
  if (!partner) notFound();

  const messages = await getThread(user.id, partnerId);

  return (
    <div className="container-page max-w-2xl py-8">
      <Link href="/messages" className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={14} /> Back to messages
      </Link>
      <div className="card">
        <div className="border-b border-border p-4">
          <h1 className="text-base font-bold text-foreground">{partner.name}</h1>
        </div>
        <MessageThread partnerId={partnerId} currentUserId={user.id} messages={messages} />
      </div>
    </div>
  );
}
