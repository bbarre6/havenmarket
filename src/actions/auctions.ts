"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-helpers";
import { placeBid, buyNowAuction } from "@/lib/auctions";
import { bidSchema } from "@/lib/validation";
import { checkBidRateLimit } from "@/lib/rate-limit";

export type BidFormState = {
  error?: string;
  success?: boolean;
  currentBid?: number;
};

export async function placeBidAction(
  listingSlug: string,
  _prevState: BidFormState,
  formData: FormData
): Promise<BidFormState> {
  const user = await requireUser();

  const limited = await checkBidRateLimit(user.id);
  if (limited) {
    return { error: limited };
  }

  const parsed = bidSchema.safeParse({
    auctionId: formData.get("auctionId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid bid." };
  }

  const result = await placeBid(parsed.data.auctionId, user.id, parsed.data.amount);
  revalidatePath(`/product/${listingSlug}`);

  if (!result.ok) {
    return { error: result.error };
  }
  return { success: true, currentBid: result.currentBid };
}

export async function buyNowAction(listingSlug: string, auctionId: string): Promise<BidFormState> {
  const user = await requireUser();
  const result = await buyNowAuction(auctionId, user.id);
  revalidatePath(`/product/${listingSlug}`);
  if (!result.ok) {
    return { error: result.error };
  }
  return { success: true, currentBid: result.currentBid };
}
