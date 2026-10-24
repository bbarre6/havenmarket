import Link from "next/link";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserForPage } from "@/lib/auth-helpers";
import { listingCardSelect } from "@/lib/types";
import ProductGrid from "@/components/ProductGrid";

export default async function WatchlistPage() {
  const user = await requireUserForPage("/account/watchlist");

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: listingCardSelect } },
  });

  const listings = watchlist.map((w) => w.listing).filter((l) => l.status === "ACTIVE");

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <h1 className="text-xl font-bold text-foreground">Your watchlist</h1>
      {listings.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <Heart size={28} className="text-muted" />
          <p className="text-sm text-muted">Nothing saved yet. Tap the heart on any listing to track it here.</p>
          <Link href="/search" className="btn btn-primary">
            Browse listings
          </Link>
        </div>
      ) : (
        <ProductGrid listings={listings} watchingIds={new Set(listings.map((l) => l.id))} />
      )}
    </div>
  );
}
