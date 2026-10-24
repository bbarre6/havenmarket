import Link from "next/link";
import Image from "next/image";
import { Gavel } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { conditionLabel } from "@/lib/format";
import type { ListingCard } from "@/lib/types";
import CountdownTimer from "@/components/CountdownTimer";
import WatchlistButton from "@/components/WatchlistButton";

export default function ProductCard({ listing, isWatching }: { listing: ListingCard; isWatching?: boolean }) {
  const image = listing.images[0]?.url;
  const isAuction = listing.listingType === "AUCTION" && listing.auction;

  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:shadow-md">
      <WatchlistButton listingId={listing.id} initialWatching={Boolean(isWatching)} className="absolute right-2 top-2 z-10" />
      <Link href={`/product/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
          {image && (
            <Image
              src={image}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          )}
          {isAuction && (
            <span className="badge badge-blue absolute left-2 top-2">
              <Gavel size={11} /> Auction
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/product/${listing.slug}`}>
          <h3 className="line-clamp-2-safe text-sm font-medium text-foreground hover:text-brand">{listing.title}</h3>
        </Link>
        <span className="badge badge-gray w-fit">{conditionLabel(listing.condition)}</span>

        {isAuction && listing.auction ? (
          <div className="mt-1 space-y-0.5">
            <div className="text-lg font-bold text-foreground">{formatMoney(listing.auction.currentBid)}</div>
            <div className="text-xs text-muted">{listing.auction._count.bids} bid{listing.auction._count.bids === 1 ? "" : "s"}</div>
            {listing.auction.status === "LIVE" && (
              <CountdownTimer endAt={listing.auction.endAt} className="text-xs font-medium" />
            )}
            {listing.auction.status === "UPCOMING" && (
              <span className="text-xs font-medium text-muted">Starts {new Date(listing.auction.startAt).toLocaleDateString()}</span>
            )}
          </div>
        ) : (
          <div className="mt-1 text-lg font-bold text-foreground">{formatMoney(listing.price)}</div>
        )}

        <div className="mt-auto text-xs text-muted">
          {listing.freeShipping || listing.shippingCost === 0 ? (
            <span className="font-medium text-success">Free shipping</span>
          ) : (
            <span>+{formatMoney(listing.shippingCost)} shipping</span>
          )}
        </div>
      </div>
    </div>
  );
}
