"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function toggleWatchlist(listingId: string): Promise<{ watching: boolean }> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("You must be signed in to use your watchlist.");
  }

  const existing = await prisma.watchlist.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
    revalidatePath("/", "layout");
    return { watching: false };
  }

  await prisma.watchlist.create({ data: { userId: user.id, listingId } });
  revalidatePath("/", "layout");
  return { watching: true };
}

export async function removeFromWatchlist(listingId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  await prisma.watchlist.deleteMany({ where: { userId: user.id, listingId } });
  revalidatePath("/", "layout");
}
