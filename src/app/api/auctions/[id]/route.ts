import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeIfExpired, promoteUpcomingAuctions } from "@/lib/auctions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await promoteUpcomingAuctions();
  await finalizeIfExpired(id);

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      winner: { select: { id: true, name: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 20,
        include: { bidder: { select: { id: true, name: true } } },
      },
    },
  });

  if (!auction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: auction.id,
    status: auction.status,
    currentBid: auction.currentBid,
    bidIncrement: auction.bidIncrement,
    buyNowPrice: auction.buyNowPrice,
    startAt: auction.startAt,
    endAt: auction.endAt,
    winner: auction.winner ? { id: auction.winner.id, name: auction.winner.name } : null,
    bids: auction.bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      createdAt: b.createdAt,
      bidderName: b.bidder.name,
    })),
  });
}
