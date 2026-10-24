"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { reviewSchema } from "@/lib/validation";
import { getEligibleOrderForReview } from "@/lib/reviews";

export type ReviewFormState = { error?: string; success?: boolean };

export async function submitReviewAction(
  listingSlug: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse({
    orderId: formData.get("orderId"),
    listingId: formData.get("listingId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const eligibleOrderId = await getEligibleOrderForReview(user.id, parsed.data.listingId);
  if (!eligibleOrderId || eligibleOrderId !== parsed.data.orderId) {
    return { error: "You can only review items you've purchased and received." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return { error: "Listing not found." };

  await prisma.review.create({
    data: {
      listingId: parsed.data.listingId,
      orderId: parsed.data.orderId,
      reviewerId: user.id,
      sellerId: listing.sellerId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/product/${listingSlug}`);
  return { success: true };
}
