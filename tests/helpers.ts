import { prisma } from "@/lib/prisma";

let counter = 0;
function uid(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export async function createUser(overrides: Partial<{ name: string; email: string }> = {}) {
  const id = uid("user");
  return prisma.user.create({
    data: {
      name: overrides.name ?? id,
      email: overrides.email ?? `${id}@test.local`,
      passwordHash: "test-hash",
    },
  });
}

export async function createCategory() {
  const id = uid("cat");
  return prisma.category.create({ data: { name: id, slug: id } });
}

export async function createListing(sellerId: string, categoryId: string, overrides: Record<string, unknown> = {}) {
  const id = uid("listing");
  return prisma.listing.create({
    data: {
      sellerId,
      categoryId,
      title: id,
      slug: id,
      description: "Test listing description that is long enough.",
      condition: "NEW",
      listingType: "FIXED_PRICE",
      price: 100,
      quantity: 5,
      quantityAvailable: 5,
      status: "ACTIVE",
      ...overrides,
    },
  });
}

export async function createAuctionListing(
  sellerId: string,
  categoryId: string,
  auctionOverrides: Record<string, unknown> = {}
) {
  const listing = await createListing(sellerId, categoryId, {
    listingType: "AUCTION",
    price: 50,
    quantity: 1,
    quantityAvailable: 1,
  });

  const auction = await prisma.auction.create({
    data: {
      listingId: listing.id,
      startingBid: 50,
      currentBid: 50,
      bidIncrement: 5,
      startAt: new Date(Date.now() - 1000 * 60 * 60),
      endAt: new Date(Date.now() + 1000 * 60 * 60),
      status: "LIVE",
      ...auctionOverrides,
    },
  });

  return { listing, auction };
}
