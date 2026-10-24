import { prisma } from "@/lib/prisma";

export async function getConversations(userId: string) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  const byPartner = new Map<
    string,
    { partnerId: string; partnerName: string; lastMessage: string; lastAt: Date; unread: number }
  >();

  for (const m of messages) {
    const isSender = m.senderId === userId;
    const partner = isSender ? m.receiver : m.sender;
    const existing = byPartner.get(partner.id);
    const unreadIncrement = !isSender && !m.readAt ? 1 : 0;

    if (!existing) {
      byPartner.set(partner.id, {
        partnerId: partner.id,
        partnerName: partner.name,
        lastMessage: m.body,
        lastAt: m.createdAt,
        unread: unreadIncrement,
      });
    } else {
      existing.unread += unreadIncrement;
    }
  }

  return Array.from(byPartner.values()).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

export async function getThread(userId: string, partnerId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });
}
