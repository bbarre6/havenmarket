import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { placeBid, buyNowAuction, finalizeIfExpired } from "@/lib/auctions";
import { createUser, createCategory, createAuctionListing } from "./helpers";

describe("placeBid", () => {
  it("accepts a bid at or above the starting bid when there are no bids yet", async () => {
    const seller = await createUser();
    const bidder = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id, { startingBid: 50, currentBid: 50, bidIncrement: 5 });

    const result = await placeBid(auction.id, bidder.id, 50);
    expect(result.ok).toBe(true);

    const bids = await prisma.bid.findMany({ where: { auctionId: auction.id } });
    expect(bids).toHaveLength(1);
    expect(bids[0].amount).toBe(50);
  });

  it("rejects a bid below the minimum increment above the current bid", async () => {
    const seller = await createUser();
    const bidder = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id, { startingBid: 50, currentBid: 50, bidIncrement: 5 });

    await placeBid(auction.id, bidder.id, 50);
    const second = await placeBid(auction.id, bidder.id, 52); // needs to be >= 55

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toMatch(/at least/i);
  });

  it("rejects the seller bidding on their own auction", async () => {
    const seller = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id);

    const result = await placeBid(auction.id, seller.id, 100);
    expect(result.ok).toBe(false);
  });

  it("rejects bids placed after the auction end time", async () => {
    const seller = await createUser();
    const bidder = await createUser();
    const category = await createCategory();
    const { auction, listing } = await createAuctionListing(seller.id, category.id, {
      startAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      endAt: new Date(Date.now() - 1000), // already ended
    });

    const result = await placeBid(auction.id, bidder.id, 100);
    expect(result.ok).toBe(false);

    // Reading an expired auction finalizes it lazily, with no winner since there were no bids.
    const updatedAuction = await prisma.auction.findUnique({ where: { id: auction.id } });
    expect(updatedAuction?.status).toBe("ENDED");
    const updatedListing = await prisma.listing.findUnique({ where: { id: listing.id } });
    expect(updatedListing?.status).toBe("ENDED");
  });

  it("prevents a lower concurrent bid from winning a race against a higher one", async () => {
    const seller = await createUser();
    const bidderA = await createUser();
    const bidderB = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id, { startingBid: 50, currentBid: 50, bidIncrement: 5 });

    // Two bidders race to place a bid based on the same starting state.
    const [resultA, resultB] = await Promise.all([placeBid(auction.id, bidderA.id, 60), placeBid(auction.id, bidderB.id, 55)]);

    const outcomes = [resultA, resultB];
    const succeeded = outcomes.filter((r) => r.ok);
    // At least one must succeed; whichever is recorded, the auction's currentBid must reflect
    // a bid that was actually accepted and persisted (never a phantom higher number from a lost race).
    expect(succeeded.length).toBeGreaterThanOrEqual(1);

    const finalAuction = await prisma.auction.findUnique({ where: { id: auction.id } });
    const bids = await prisma.bid.findMany({ where: { auctionId: auction.id } });
    const maxRecordedBid = Math.max(...bids.map((b) => b.amount));
    expect(finalAuction?.currentBid).toBe(maxRecordedBid);
  });

  it("finalizes the auction and marks the listing SOLD when buy-it-now price is met", async () => {
    const seller = await createUser();
    const bidder = await createUser();
    const category = await createCategory();
    const { auction, listing } = await createAuctionListing(seller.id, category.id, {
      startingBid: 50,
      currentBid: 50,
      bidIncrement: 5,
      buyNowPrice: 100,
    });

    const result = await placeBid(auction.id, bidder.id, 100);
    expect(result.ok).toBe(true);

    const updatedAuction = await prisma.auction.findUnique({ where: { id: auction.id } });
    expect(updatedAuction?.status).toBe("ENDED");
    expect(updatedAuction?.winnerId).toBe(bidder.id);

    const updatedListing = await prisma.listing.findUnique({ where: { id: listing.id } });
    expect(updatedListing?.status).toBe("SOLD");
  });
});

describe("buyNowAuction", () => {
  it("rejects buy-now once bidding has already reached the buy-now price", async () => {
    const seller = await createUser();
    const bidderA = await createUser();
    const bidderB = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id, {
      startingBid: 50,
      currentBid: 150,
      bidIncrement: 5,
      buyNowPrice: 100,
    });
    await prisma.bid.create({ data: { auctionId: auction.id, bidderId: bidderA.id, amount: 150 } });

    const result = await buyNowAuction(auction.id, bidderB.id);
    expect(result.ok).toBe(false);
  });

  it("lets a buyer win instantly at the buy-now price", async () => {
    const seller = await createUser();
    const buyer = await createUser();
    const category = await createCategory();
    const { auction, listing } = await createAuctionListing(seller.id, category.id, {
      startingBid: 50,
      currentBid: 50,
      bidIncrement: 5,
      buyNowPrice: 100,
    });

    const result = await buyNowAuction(auction.id, buyer.id);
    expect(result.ok).toBe(true);

    const updatedAuction = await prisma.auction.findUnique({ where: { id: auction.id } });
    expect(updatedAuction?.status).toBe("ENDED");
    expect(updatedAuction?.winnerId).toBe(buyer.id);

    const updatedListing = await prisma.listing.findUnique({ where: { id: listing.id } });
    expect(updatedListing?.status).toBe("SOLD");
  });
});

describe("finalizeIfExpired", () => {
  it("is idempotent when called multiple times on the same expired auction", async () => {
    const seller = await createUser();
    const bidder = await createUser();
    const category = await createCategory();
    const { auction } = await createAuctionListing(seller.id, category.id, {
      startAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      endAt: new Date(Date.now() - 1000),
    });
    await prisma.bid.create({ data: { auctionId: auction.id, bidderId: bidder.id, amount: 75 } });

    await Promise.all([finalizeIfExpired(auction.id), finalizeIfExpired(auction.id), finalizeIfExpired(auction.id)]);

    const final = await prisma.auction.findUnique({ where: { id: auction.id } });
    expect(final?.status).toBe("ENDED");
    expect(final?.winnerId).toBe(bidder.id);
  });
});
