import { prisma } from "@/lib/prisma";

/**
 * Auctions close lazily: whenever an expired LIVE auction is read, it is
 * finalized server-side (winner determined from the highest bid, status
 * flipped to ENDED, listing flipped to SOLD/ENDED). This should eventually
 * move to a scheduled job, but the read-time check keeps auctions correct
 * without any background worker in the meantime.
 */
export async function finalizeIfExpired(auctionId: string) {
  const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
  if (!auction) return null;
  if (auction.status !== "LIVE") return auction;
  if (auction.endAt.getTime() > Date.now()) return auction;

  return prisma.$transaction(async (tx) => {
    const fresh = await tx.auction.findUnique({ where: { id: auctionId } });
    if (!fresh || fresh.status !== "LIVE" || fresh.endAt.getTime() > Date.now()) {
      return fresh;
    }
    const topBid = await tx.bid.findFirst({ where: { auctionId }, orderBy: { amount: "desc" } });
    const updated = await tx.auction.update({
      where: { id: auctionId },
      data: { status: "ENDED", winnerId: topBid?.bidderId, finalizedAt: new Date() },
    });
    await tx.listing.update({
      where: { id: fresh.listingId },
      data: { status: topBid ? "SOLD" : "ENDED" },
    });
    return updated;
  });
}

export async function finalizeExpiredAuctions() {
  const expired = await prisma.auction.findMany({
    where: { status: "LIVE", endAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const a of expired) {
    await finalizeIfExpired(a.id);
  }
}

export async function promoteUpcomingAuctions() {
  await prisma.auction.updateMany({
    where: { status: "UPCOMING", startAt: { lte: new Date() } },
    data: { status: "LIVE" },
  });
}

export type BidResult =
  | { ok: true; currentBid: number }
  | { ok: false; error: string };

export async function placeBid(auctionId: string, bidderId: string, amount: number): Promise<BidResult> {
  await promoteUpcomingAuctions();
  await finalizeIfExpired(auctionId);

  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.listing.sellerId === bidderId) return { ok: false, error: "You can't bid on your own listing." };
  if (auction.status !== "LIVE") return { ok: false, error: "This auction is not currently accepting bids." };
  if (auction.endAt.getTime() <= Date.now()) return { ok: false, error: "This auction has already ended." };

  const hasBids = (await prisma.bid.count({ where: { auctionId } })) > 0;
  const minAcceptable = hasBids ? auction.currentBid + auction.bidIncrement : auction.startingBid;

  if (amount < minAcceptable) {
    return { ok: false, error: `Your bid must be at least ${minAcceptable.toFixed(2)}.` };
  }

  const result = await prisma.auction.updateMany({
    where: { id: auctionId, status: "LIVE", currentBid: auction.currentBid },
    data: { currentBid: amount },
  });

  if (result.count !== 1) {
    return { ok: false, error: "Someone else just placed a bid. Please refresh your bid amount and try again." };
  }

  await prisma.bid.create({ data: { auctionId, bidderId, amount } });

  if (auction.buyNowPrice && amount >= auction.buyNowPrice) {
    await buyNowAuction(auctionId, bidderId, true);
  }

  return { ok: true, currentBid: amount };
}

export async function buyNowAuction(auctionId: string, buyerId: string, alreadyHighestBidder = false): Promise<BidResult> {
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
  if (!auction) return { ok: false, error: "Auction not found." };
  if (!auction.buyNowPrice) return { ok: false, error: "This auction does not support Buy It Now." };
  if (auction.listing.sellerId === buyerId) return { ok: false, error: "You can't buy your own listing." };
  if (auction.status !== "LIVE") return { ok: false, error: "This auction is no longer live." };

  if (!alreadyHighestBidder) {
    const existingHighest = await prisma.bid.findFirst({ where: { auctionId }, orderBy: { amount: "desc" } });
    if (existingHighest && existingHighest.amount >= auction.buyNowPrice) {
      return { ok: false, error: "Buy It Now is no longer available — bidding has exceeded that price." };
    }
    await prisma.bid.create({ data: { auctionId, bidderId: buyerId, amount: auction.buyNowPrice } });
  }

  const result = await prisma.auction.updateMany({
    where: { id: auctionId, status: "LIVE" },
    data: { status: "ENDED", winnerId: buyerId, currentBid: auction.buyNowPrice, finalizedAt: new Date() },
  });

  if (result.count !== 1) {
    return { ok: false, error: "This auction was just finalized by someone else." };
  }

  await prisma.listing.update({ where: { id: auction.listingId }, data: { status: "SOLD" } });

  return { ok: true, currentBid: auction.buyNowPrice };
}
