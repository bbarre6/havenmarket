import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { listingCardSelect } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

export const PAGE_SIZE = 24;

export type SearchParamsInput = {
  q?: string;
  category?: string;
  sub?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string | string[];
  brand?: string | string[];
  listingType?: string;
  freeShipping?: string;
  location?: string;
  sort?: string;
  page?: string;
};

function toArray(v?: string | string[]): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function resolveCategoryFilter(category?: string, sub?: string) {
  if (sub) {
    const cat = await prisma.category.findUnique({ where: { slug: sub } });
    return cat ? [cat.id] : [];
  }
  if (category) {
    const cats = await prisma.category.findMany({
      where: { OR: [{ slug: category }, { parent: { slug: category } }] },
      select: { id: true },
    });
    return cats.map((c) => c.id);
  }
  return null;
}

export async function searchListings(params: SearchParamsInput) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const conditions = toArray(params.condition);
  const brands = toArray(params.brand);
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  const categoryIds = await resolveCategoryFilter(params.category, params.sub);

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
  };

  if (categoryIds !== null) {
    where.categoryId = { in: categoryIds.length ? categoryIds : ["__none__"] };
  }

  if (params.q) {
    const q = params.q.trim();
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
      ];
    }
  }

  if (conditions.length) {
    where.condition = { in: conditions as Prisma.EnumConditionFilter["in"] };
  }

  if (brands.length) {
    where.brand = { in: brands };
  }

  if (params.listingType === "FIXED_PRICE" || params.listingType === "AUCTION") {
    where.listingType = params.listingType;
  }

  if (params.freeShipping === "1") {
    where.freeShipping = true;
  }

  if (params.location && params.location.trim()) {
    where.location = { contains: params.location.trim() };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !Number.isNaN(minPrice)) where.price.gte = minPrice;
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  switch (params.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "popularity":
      orderBy = { views: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "ending-soon":
      where.listingType = "AUCTION";
      orderBy = { auction: { endAt: "asc" } };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [items, total, brandFacetRows] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: listingCardSelect,
    }),
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where: { status: "ACTIVE", categoryId: categoryIds !== null ? { in: categoryIds.length ? categoryIds : ["__none__"] } : undefined },
      select: { brand: true },
      distinct: ["brand"],
    }),
  ]);

  const brandFacets = brandFacetRows.map((b) => b.brand).filter((b): b is string => Boolean(b)).sort();

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    brandFacets,
  };
}

export async function getFeaturedListings() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { views: "desc" },
    take: 8,
    select: listingCardSelect,
  });
}

export async function getTrendingListings() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: listingCardSelect,
  });
}

export async function getEndingSoonAuctions() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE", listingType: "AUCTION", auction: { status: "LIVE" } },
    orderBy: { auction: { endAt: "asc" } },
    take: 8,
    select: listingCardSelect,
  });
}

export async function getRelatedListings(categoryId: string, excludeId: string) {
  return prisma.listing.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: excludeId } },
    take: 6,
    orderBy: { views: "desc" },
    select: listingCardSelect,
  });
}

export const getListingBySlug = cache(async function getListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: { select: { id: true, name: true, storeName: true, bio: true, createdAt: true } },
      category: { select: { id: true, name: true, slug: true, parent: { select: { name: true, slug: true } } } },
      auction: { include: { bids: { orderBy: { amount: "desc" }, take: 20, include: { bidder: { select: { id: true, name: true } } } } } },
      questions: { orderBy: { createdAt: "desc" }, include: { asker: { select: { id: true, name: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { id: true, name: true } } } },
    },
  });
});
