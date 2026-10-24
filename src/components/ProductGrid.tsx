import ProductCard from "@/components/ProductCard";
import type { ListingCard } from "@/lib/types";

export default function ProductGrid({
  listings,
  watchingIds,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
}: {
  listings: ListingCard[];
  watchingIds: Set<string>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} isWatching={watchingIds.has(listing.id)} />
      ))}
    </div>
  );
}
