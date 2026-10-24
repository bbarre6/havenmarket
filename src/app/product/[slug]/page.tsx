import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Store, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getListingBySlug, getRelatedListings } from "@/lib/listings";
import { finalizeIfExpired, promoteUpcomingAuctions } from "@/lib/auctions";
import { getSessionUser } from "@/lib/auth-helpers";
import { getWatchingSet } from "@/lib/cart";
import { getSellerRating, getEligibleOrderForReview } from "@/lib/reviews";
import { formatMoney } from "@/lib/money";
import { conditionLabel } from "@/lib/format";
import ImageGallery from "@/components/ImageGallery";
import BuyBox from "@/components/BuyBox";
import AuctionPanel from "@/components/AuctionPanel";
import WatchlistButton from "@/components/WatchlistButton";
import QASection from "@/components/QASection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSellerForm from "@/components/ContactSellerForm";
import ReportListingButton from "@/components/ReportListingButton";
import StarRating from "@/components/StarRating";
import ProductGrid from "@/components/ProductGrid";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await promoteUpcomingAuctions();

  let listing = await getListingBySlug(slug);
  if (!listing) notFound();

  if (listing.auction) {
    await finalizeIfExpired(listing.auction.id);
    listing = await getListingBySlug(slug);
    if (!listing) notFound();
  }

  const user = await getSessionUser();
  const isOwner = user?.id === listing.sellerId;
  const isSignedIn = Boolean(user);

  await prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const [sellerRating, related, watchingSet, eligibleOrderId] = await Promise.all([
    getSellerRating(listing.sellerId),
    getRelatedListings(listing.categoryId, listing.id),
    getWatchingSet(user?.id, [listing.id]),
    user ? getEligibleOrderForReview(user.id, listing.id) : Promise.resolve(null),
  ]);
  const relatedWatching = await getWatchingSet(user?.id, related.map((r) => r.id));

  const avgReviewRating =
    listing.reviews.length > 0 ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length : 0;

  return (
    <div className="container-page flex flex-col gap-8 py-6">
      <TrackRecentlyViewed slug={listing.slug} />

      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/search?category=${listing.category.parent?.slug ?? listing.category.slug}`} className="hover:text-brand">
          {listing.category.parent?.name ?? listing.category.name}
        </Link>{" "}
        / <span>{listing.category.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-6">
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="card p-5 lg:hidden">
            <ProductSummary listing={listing} />
          </div>

          <QASection
            listingSlug={listing.slug}
            listingId={listing.id}
            questions={listing.questions}
            isOwner={isOwner}
            isSignedIn={isSignedIn}
          />

          <ReviewsSection
            listingSlug={listing.slug}
            listingId={listing.id}
            reviews={listing.reviews}
            average={avgReviewRating || sellerRating.average}
            count={listing.reviews.length}
            eligibleOrderId={eligibleOrderId}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="card hidden p-5 lg:block">
            <ProductSummary listing={listing} />
          </div>

          <div className="card p-5">
            {listing.listingType === "AUCTION" && listing.auction ? (
              <AuctionPanel
                listingSlug={listing.slug}
                isOwnListing={isOwner}
                isSignedIn={isSignedIn}
                currentUserId={user?.id}
                initialAuction={{
                  id: listing.auction.id,
                  status: listing.auction.status,
                  currentBid: listing.auction.currentBid,
                  startingBid: listing.auction.startingBid,
                  bidIncrement: listing.auction.bidIncrement,
                  buyNowPrice: listing.auction.buyNowPrice,
                  startAt: listing.auction.startAt.toISOString(),
                  endAt: listing.auction.endAt.toISOString(),
                  winner: null,
                }}
                initialBids={listing.auction.bids.map((b) => ({
                  id: b.id,
                  amount: b.amount,
                  createdAt: b.createdAt.toISOString(),
                  bidderName: b.bidder.name,
                }))}
              />
            ) : (
              <BuyBox
                listingId={listing.id}
                price={listing.price}
                quantityAvailable={listing.quantityAvailable}
                isOwnListing={isOwner}
                isSignedIn={isSignedIn}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <WatchlistButton listingId={listing.id} initialWatching={watchingSet.has(listing.id)} showLabel className="w-full justify-center" />
          </div>

          <div className="card flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Store size={16} /> {listing.seller.storeName || listing.seller.name}
            </div>
            <StarRating rating={sellerRating.average} count={sellerRating.count} />
            <p className="text-xs text-muted">Member since {new Date(listing.seller.createdAt).getFullYear()}</p>
            {!isOwner && <ContactSellerForm sellerId={listing.sellerId} listingId={listing.id} isSignedIn={isSignedIn} />}
          </div>

          <div className="card flex flex-col gap-2 p-5 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Truck size={15} />
              {listing.freeShipping || listing.shippingCost === 0 ? (
                <span className="font-medium text-success">Free shipping</span>
              ) : (
                <span>{formatMoney(listing.shippingCost)} shipping</span>
              )}
              <span className="text-muted">· Est. {listing.shippingEstimateDays} business days</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin size={15} /> Located in {listing.location}
            </div>
          </div>

          <ReportListingButton listingId={listing.id} isSignedIn={isSignedIn} />
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Related products</h2>
          <ProductGrid listings={related} watchingIds={relatedWatching} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />
        </section>
      )}
    </div>
  );
}

function ProductSummary({
  listing,
}: {
  listing: Awaited<ReturnType<typeof getListingBySlug>> extends infer T ? NonNullable<T> : never;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-gray">{conditionLabel(listing.condition)}</span>
        {listing.brand && <span className="badge badge-blue">{listing.brand}</span>}
        <span className="text-xs text-muted">{listing.views} views</span>
      </div>
      <p className="whitespace-pre-line text-sm text-muted">{listing.description}</p>
    </div>
  );
}
