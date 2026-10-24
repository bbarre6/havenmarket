import ProductCard from "@/components/ProductCard";
import type { ListingCard } from "@/lib/types";

export default function ProductRow({
  listings,
  watchingIds,
}: {
  listings: ListingCard[];
  watchingIds: Set<string>;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {listings.map((listing) => (
        <div key={listing.id} className="w-[180px] shrink-0 sm:w-[210px]">
          <ProductCard listing={listing} isWatching={watchingIds.has(listing.id)} />
        </div>
      ))}
    </div>
  );
}
