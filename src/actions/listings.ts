"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireFullUser } from "@/lib/auth-helpers";
import { listingSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slug";
import { saveUploadedImages } from "@/lib/uploads";

export type ListingFormState = { error?: string };

function parseListingFormData(formData: FormData, imagesOverride?: string[]) {
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    brand: formData.get("brand") || "",
    location: formData.get("location") || "United States",
    listingType: formData.get("listingType"),
    price: formData.get("price"),
    quantity: formData.get("quantity") || "1",
    shippingCost: formData.get("shippingCost") || "0",
    freeShipping: formData.get("freeShipping") === "on",
    shippingEstimateDays: formData.get("shippingEstimateDays") || "5",
    images: imagesOverride ?? formData.getAll("imageUrls").map(String).filter(Boolean),
    auctionDurationHours: formData.get("auctionDurationHours") || undefined,
    startingBid: formData.get("startingBid") || undefined,
    bidIncrement: formData.get("bidIncrement") || undefined,
    buyNowPrice: formData.get("buyNowPrice") || undefined,
  });
}

export async function createListingAction(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const user = await requireFullUser();

  let uploadedUrls: string[] = [];
  const files = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 0) {
    try {
      uploadedUrls = await saveUploadedImages(files);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const existingImageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const allImages = [...existingImageUrls, ...uploadedUrls];

  const parsed = parseListingFormData(formData, allImages);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the listing details." };
  }

  const data = parsed.data;
  const slug = uniqueSlug(data.title);

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      categoryId: data.categoryId,
      title: data.title,
      slug,
      description: data.description,
      condition: data.condition,
      listingType: data.listingType,
      price: data.listingType === "AUCTION" ? data.startingBid! : data.price,
      quantity: data.listingType === "AUCTION" ? 1 : data.quantity,
      quantityAvailable: data.listingType === "AUCTION" ? 1 : data.quantity,
      brand: data.brand || null,
      location: data.location,
      shippingCost: data.shippingCost,
      freeShipping: data.freeShipping,
      shippingEstimateDays: data.shippingEstimateDays,
      status: "ACTIVE",
      images: { create: data.images.map((url, position) => ({ url, position })) },
    },
  });

  if (data.listingType === "AUCTION") {
    const startAt = new Date();
    const endAt = new Date(Date.now() + data.auctionDurationHours! * 60 * 60 * 1000);
    await prisma.auction.create({
      data: {
        listingId: listing.id,
        startingBid: data.startingBid!,
        currentBid: data.startingBid!,
        bidIncrement: data.bidIncrement || Math.max(1, Math.round(data.startingBid! * 0.05 * 100) / 100),
        buyNowPrice: data.buyNowPrice,
        startAt,
        endAt,
        status: "LIVE",
      },
    });
  }

  if (!user.isSeller) {
    await prisma.user.update({ where: { id: user.id }, data: { isSeller: true } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect(`/product/${listing.slug}`);
}

export async function updateListingAction(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const user = await requireFullUser();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== user.id) {
    return { error: "You don't have permission to edit this listing." };
  }

  const parsed = parseListingFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the listing details." };
  }
  const data = parsed.data;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      condition: data.condition,
      brand: data.brand || null,
      location: data.location,
      shippingCost: data.shippingCost,
      freeShipping: data.freeShipping,
      shippingEstimateDays: data.shippingEstimateDays,
      ...(listing.listingType === "FIXED_PRICE"
        ? { price: data.price, quantity: data.quantity, quantityAvailable: data.quantity }
        : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/product/${listing.slug}`);
  redirect("/dashboard/listings");
}

export async function setListingStatusAction(listingId: string, status: "ACTIVE" | "PAUSED" | "DELETED") {
  const user = await requireFullUser();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== user.id) {
    throw new Error("You don't have permission to modify this listing.");
  }
  if (listing.listingType === "AUCTION" && status !== "DELETED") {
    throw new Error("Auctions can't be paused once created.");
  }
  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
}
