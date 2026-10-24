import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORY_TREE } from "@/lib/categories-data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "hourly", priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_TREE.flatMap((cat) => [
    { url: `${SITE_URL}/search?category=${cat.slug}`, changeFrequency: "daily" as const, priority: 0.6 },
    ...cat.children.map((child) => ({
      url: `${SITE_URL}/search?category=${cat.slug}&sub=${child.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/product/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
