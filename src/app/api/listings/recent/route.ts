import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingCardSelect } from "@/lib/types";
import { getSessionUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (slugs.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const [items, user] = await Promise.all([
    prisma.listing.findMany({
      where: { slug: { in: slugs }, status: "ACTIVE" },
      select: listingCardSelect,
    }),
    getSessionUser(),
  ]);

  const order = new Map(slugs.map((s, i) => [s, i]));
  items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));

  let watchingIds = new Set<string>();
  if (user) {
    const watches = await prisma.watchlist.findMany({
      where: { userId: user.id, listingId: { in: items.map((i) => i.id) } },
      select: { listingId: true },
    });
    watchingIds = new Set(watches.map((w) => w.listingId));
  }

  return NextResponse.json({
    items: items.map((item) => ({ ...item, isWatching: watchingIds.has(item.id) })),
  });
}
