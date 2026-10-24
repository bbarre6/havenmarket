"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export type CartActionResult = { ok: true } | { ok: false; error: string };

export async function addToCart(listingId: string, quantity: number = 1): Promise<CartActionResult> {
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") {
    return { ok: false, error: "This listing is no longer available." };
  }
  if (listing.listingType !== "FIXED_PRICE") {
    return { ok: false, error: "Auction items can't be added to the cart. Place a bid instead." };
  }
  if (listing.sellerId === user.id) {
    return { ok: false, error: "You can't buy your own listing." };
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  const desiredQty = (existing?.quantity ?? 0) + quantity;
  if (desiredQty > listing.quantityAvailable) {
    return { ok: false, error: `Only ${listing.quantityAvailable} left in stock.` };
  }

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQty } });
  } else {
    await prisma.cartItem.create({ data: { userId: user.id, listingId, quantity } });
  }

  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<CartActionResult> {
  const user = await requireUser();
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { listing: true } });
  if (!item || item.userId !== user.id) {
    return { ok: false, error: "Cart item not found." };
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return { ok: true };
  }

  if (quantity > item.listing.quantityAvailable) {
    return { ok: false, error: `Only ${item.listing.quantityAvailable} left in stock.` };
  }

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(cartItemId: string): Promise<CartActionResult> {
  const user = await requireUser();
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== user.id) {
    return { ok: false, error: "Cart item not found." };
  }
  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true };
}
