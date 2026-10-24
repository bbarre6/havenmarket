import { prisma } from "@/lib/prisma";
import { computeSellerPayout } from "@/lib/pricing";

export async function getSellerStats(sellerId: string) {
  const [activeListings, pausedListings, soldListings, orderItems, orderItemCount] = await Promise.all([
    prisma.listing.count({ where: { sellerId, status: "ACTIVE" } }),
    prisma.listing.count({ where: { sellerId, status: "PAUSED" } }),
    prisma.listing.count({ where: { sellerId, status: "SOLD" } }),
    prisma.orderItem.findMany({ where: { sellerId }, select: { price: true, quantity: true } }),
    prisma.orderItem.count({ where: { sellerId } }),
  ]);

  const grossRevenue = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { fee: platformFee, net: netRevenue } = computeSellerPayout(grossRevenue);

  return {
    activeListings,
    pausedListings,
    soldListings,
    grossRevenue,
    platformFee,
    totalRevenue: netRevenue,
    completedSales: orderItemCount,
  };
}

export async function getSellerListings(sellerId: string) {
  return prisma.listing.findMany({
    where: { sellerId, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      auction: true,
      category: { select: { name: true } },
      _count: { select: { orderItems: true, watchlist: true } },
    },
  });
}

export async function getSellerOrderItems(sellerId: string) {
  return prisma.orderItem.findMany({
    where: { sellerId },
    orderBy: { id: "desc" },
    include: {
      order: { include: { buyer: { select: { name: true } }, address: true } },
      listing: { select: { slug: true, images: { take: 1, orderBy: { position: "asc" } } } },
    },
  });
}

export async function getSellerQuestions(sellerId: string) {
  return prisma.question.findMany({
    where: { listing: { sellerId } },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true, slug: true } }, asker: { select: { name: true } } },
  });
}
