import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { getSellerListings } from "@/lib/seller";
import { formatMoney } from "@/lib/money";
import ListingRowActions from "@/components/ListingRowActions";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green",
  PAUSED: "badge-gray",
  SOLD: "badge-blue",
  ENDED: "badge-orange",
  DELETED: "badge-red",
};

export default async function DashboardListingsPage() {
  const user = await requireUser();
  const listings = await getSellerListings(user.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Your listings</h2>
      {listings.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">
          You haven&apos;t listed anything yet.{" "}
          <Link href="/sell" className="font-medium text-brand hover:underline">
            Create your first listing
          </Link>
          .
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {listings.map((listing) => {
            const img = listing.images[0]?.url;
            return (
              <div key={listing.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {img && <Image src={img} alt={listing.title} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${listing.slug}`} className="block truncate text-sm font-medium text-foreground hover:text-brand">
                    {listing.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {listing.category.name} · {listing._count.orderItems} sold · {listing._count.watchlist} watching
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm font-semibold text-foreground">
                  {listing.listingType === "AUCTION" && listing.auction
                    ? formatMoney(listing.auction.currentBid)
                    : formatMoney(listing.price)}
                </div>
                <span className={`badge ${STATUS_BADGE[listing.status] ?? "badge-gray"} shrink-0`}>{listing.status}</span>
                <ListingRowActions listingId={listing.id} status={listing.status} listingType={listing.listingType} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
