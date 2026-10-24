"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import type { ListingCard } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

type ItemWithWatch = ListingCard & { isWatching: boolean };

export default function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<ItemWithWatch[] | null>(null);

  useEffect(() => {
    const slugs = getRecentlyViewed().filter((s) => s !== excludeSlug);

    async function load() {
      if (slugs.length === 0) return [];
      try {
        const res = await fetch(`/api/listings/recent?slugs=${encodeURIComponent(slugs.join(","))}`);
        const data = await res.json();
        return data.items ?? [];
      } catch {
        return [];
      }
    }

    load().then(setItems);
  }, [excludeSlug]);

  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-foreground">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <ProductCard key={item.id} listing={item} isWatching={item.isWatching} />
        ))}
      </div>
    </section>
  );
}
