import type { Prisma } from "@/generated/prisma/client";

export const listingCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  condition: true,
  listingType: true,
  shippingCost: true,
  freeShipping: true,
  location: true,
  status: true,
  views: true,
  createdAt: true,
  images: { orderBy: { position: "asc" as const }, take: 1 },
  auction: {
    select: {
      id: true,
      currentBid: true,
      startingBid: true,
      bidIncrement: true,
      buyNowPrice: true,
      startAt: true,
      endAt: true,
      status: true,
      _count: { select: { bids: true } },
    },
  },
  seller: { select: { id: true, name: true, storeName: true } },
  category: { select: { id: true, name: true, slug: true, parentId: true } },
  _count: { select: { watchlist: true } },
} satisfies Prisma.ListingSelect;

export type ListingCard = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;
