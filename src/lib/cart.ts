import { prisma } from "@/lib/prisma";

export async function getCartCount(userId: string | undefined) {
  if (!userId) return 0;
  const items = await prisma.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });
  return items._sum.quantity ?? 0;
}

export async function getWatchlistCount(userId: string | undefined) {
  if (!userId) return 0;
  return prisma.watchlist.count({ where: { userId } });
}

export async function getWatchingSet(userId: string | undefined, listingIds: string[]): Promise<Set<string>> {
  if (!userId || listingIds.length === 0) return new Set();
  const rows = await prisma.watchlist.findMany({
    where: { userId, listingId: { in: listingIds } },
    select: { listingId: true },
  });
  return new Set(rows.map((r) => r.listingId));
}
