import Link from "next/link";
import { ArrowRight, Gavel, PackagePlus, ShieldCheck, Store, Truck } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { getWatchingSet } from "@/lib/cart";
import { getFeaturedListings, getTrendingListings, getEndingSoonAuctions } from "@/lib/listings";
import { finalizeExpiredAuctions, promoteUpcomingAuctions } from "@/lib/auctions";
import { CATEGORY_TREE } from "@/lib/categories-data";
import { ICON_MAP } from "@/lib/icon-map";
import ProductRow from "@/components/ProductRow";
import RecentlyViewed from "@/components/RecentlyViewed";

export default async function HomePage() {
  await promoteUpcomingAuctions();
  await finalizeExpiredAuctions();

  const user = await getSessionUser();
  const [trending, featured, endingSoon] = await Promise.all([
    getTrendingListings(),
    getFeaturedListings(),
    getEndingSoonAuctions(),
  ]);

  const allIds = [...trending, ...featured, ...endingSoon].map((l) => l.id);
  const watchingIds = await getWatchingSet(user?.id, allIds);

  return (
    <div className="container-page flex flex-col gap-12 py-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand to-brand-dark px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="max-w-xl">
          <span className="badge bg-white/15 text-white">Now live</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Buy it, sell it, bid on it.
          </h1>
          <p className="mt-3 text-base text-white/85">
            Deals across electronics, fashion, home, auto, collectibles, and sports — plus live auctions ending
            every day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className="btn bg-white text-brand hover:bg-white/90">
              Shop all deals <ArrowRight size={16} />
            </Link>
            <Link href="/search?listingType=AUCTION&sort=ending-soon" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Gavel size={16} /> Live auctions
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TrustCard icon={<ShieldCheck size={20} />} title="Buyer protection" body="Secure checkout and verified purchase reviews." />
        <TrustCard icon={<Truck size={20} />} title="Tracked shipping" body="Every order includes shipping costs and delivery estimates up front." />
        <TrustCard icon={<Gavel size={20} />} title="Live bidding" body="Server-validated auctions with real-time countdowns." />
      </section>

      {/* Popular categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Popular categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_TREE.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Store;
            return (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="card flex flex-col items-center gap-2 p-5 text-center hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand">
                  <Icon size={20} />
                </span>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured auctions */}
      {endingSoon.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Gavel size={18} className="text-brand" /> Featured auctions — ending soon
            </h2>
            <Link href="/search?listingType=AUCTION&sort=ending-soon" className="text-sm font-medium text-brand hover:underline">
              See all
            </Link>
          </div>
          <ProductRow listings={endingSoon} watchingIds={watchingIds} />
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Trending now</h2>
            <Link href="/search?sort=newest" className="text-sm font-medium text-brand hover:underline">
              See all
            </Link>
          </div>
          <ProductRow listings={trending} watchingIds={watchingIds} />
        </section>
      )}

      {/* Recommended / featured */}
      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recommended for you</h2>
            <Link href="/search?sort=popularity" className="text-sm font-medium text-brand hover:underline">
              See all
            </Link>
          </div>
          <ProductRow listings={featured} watchingIds={watchingIds} />
        </section>
      )}

      {/* Empty marketplace state */}
      {trending.length === 0 && featured.length === 0 && endingSoon.length === 0 && (
        <section className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand">
            <PackagePlus size={26} />
          </span>
          <h2 className="text-lg font-bold text-foreground">No listings yet</h2>
          <p className="max-w-sm text-sm text-muted">
            This marketplace is brand new — once sellers start listing items, they&apos;ll show up here.
          </p>
          <Link href="/sell" className="btn btn-primary mt-2">
            List the first item <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed />

      {/* Start selling CTA */}
      <section className="card flex flex-col items-center gap-4 p-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-xl font-bold text-foreground">Have something to sell?</h2>
          <p className="mt-1 text-sm text-muted">
            List it in minutes — fixed price or auction. Reach buyers browsing every category.
          </p>
        </div>
        <Link href="/sell" className="btn btn-primary shrink-0">
          Start selling <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted">{body}</div>
      </div>
    </div>
  );
}
