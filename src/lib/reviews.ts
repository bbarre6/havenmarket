import { prisma } from "@/lib/prisma";

export async function getSellerRating(sellerId: string) {
  const agg = await prisma.review.aggregate({
    where: { sellerId },
    _avg: { rating: true },
    _count: true,
  });
  return {
    average: agg._avg.rating ?? 0,
    count: agg._count,
  };
}

export async function getEligibleOrderForReview(userId: string, listingId: string) {
  const existingReview = await prisma.review.findFirst({ where: { reviewerId: userId, listingId } });
  if (existingReview) return null;

  const orderItem = await prisma.orderItem.findFirst({
    where: {
      listingId,
      order: { buyerId: userId, status: { in: ["DELIVERED", "SHIPPED", "PAID"] } },
    },
    orderBy: { id: "desc" },
    select: { orderId: true },
  });
  return orderItem?.orderId ?? null;
}
