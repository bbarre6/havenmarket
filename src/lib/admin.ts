import { prisma } from "@/lib/prisma";
import { computeSellerPayout } from "@/lib/pricing";

const COMPLETED_ORDER_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

export async function getSiteStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalSellers,
    newUsers7d,
    listingsByStatus,
    totalOrders,
    completedOrders,
    completedOrderItems,
    totalAuctions,
    liveAuctions,
    totalBids,
    openReports,
    totalCategories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isSeller: true } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: { in: [...COMPLETED_ORDER_STATUSES] } },
      select: { total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: [...COMPLETED_ORDER_STATUSES] } } },
      select: { price: true, quantity: true },
    }),
    prisma.auction.count(),
    prisma.auction.count({ where: { status: "LIVE" } }),
    prisma.bid.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.category.count(),
  ]);

  const listingCounts: Record<string, number> = {
    ACTIVE: 0,
    PAUSED: 0,
    SOLD: 0,
    ENDED: 0,
    DRAFT: 0,
    DELETED: 0,
  };
  for (const row of listingsByStatus) {
    listingCounts[row.status] = row._count._all;
  }
  const totalListings = Object.values(listingCounts).reduce((a, b) => a + b, 0);

  const gmv = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Platform revenue (the 10% seller fee), same basis as the per-seller
  // payout math in src/lib/pricing.ts — applied to item subtotal, not the
  // shipping/tax portion of the order total.
  const itemsGross = completedOrderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const platformRevenue = computeSellerPayout(itemsGross).fee;

  return {
    totalUsers,
    totalSellers,
    newUsers7d,
    totalListings,
    listingCounts,
    totalOrders,
    completedOrderCount: completedOrders.length,
    gmv,
    platformRevenue,
    totalAuctions,
    liveAuctions,
    totalBids,
    openReports,
    totalCategories,
  };
}

export async function getReports(status?: "OPEN" | "REVIEWED" | "DISMISSED" | "ACTIONED") {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    include: {
      listing: {
        select: { id: true, title: true, slug: true, status: true, seller: { select: { id: true, name: true, email: true } } },
      },
      reporter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReportCounts() {
  const counts = await prisma.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const byStatus: Record<string, number> = { OPEN: 0, REVIEWED: 0, DISMISSED: 0, ACTIONED: 0 };
  for (const row of counts) {
    byStatus[row.status] = row._count._all;
  }
  return byStatus;
}
