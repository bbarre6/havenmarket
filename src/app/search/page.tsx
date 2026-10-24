import { Frown } from "lucide-react";
import { searchListings, type SearchParamsInput } from "@/lib/listings";
import { finalizeExpiredAuctions, promoteUpcomingAuctions } from "@/lib/auctions";
import { getSessionUser } from "@/lib/auth-helpers";
import { getWatchingSet } from "@/lib/cart";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import FiltersSidebar from "@/components/FiltersSidebar";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const normalized: SearchParamsInput = {
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    category: typeof rawParams.category === "string" ? rawParams.category : undefined,
    sub: typeof rawParams.sub === "string" ? rawParams.sub : undefined,
    minPrice: typeof rawParams.minPrice === "string" ? rawParams.minPrice : undefined,
    maxPrice: typeof rawParams.maxPrice === "string" ? rawParams.maxPrice : undefined,
    condition: rawParams.condition,
    brand: rawParams.brand,
    listingType: typeof rawParams.listingType === "string" ? rawParams.listingType : undefined,
    freeShipping: typeof rawParams.freeShipping === "string" ? rawParams.freeShipping : undefined,
    location: typeof rawParams.location === "string" ? rawParams.location : undefined,
    sort: typeof rawParams.sort === "string" ? rawParams.sort : undefined,
    page: typeof rawParams.page === "string" ? rawParams.page : undefined,
  };

  await promoteUpcomingAuctions();
  await finalizeExpiredAuctions();

  const [{ items, total, page, totalPages, brandFacets }, user] = await Promise.all([
    searchListings(normalized),
    getSessionUser(),
  ]);

  const watchingIds = await getWatchingSet(user?.id, items.map((i) => i.id));

  const heading = normalized.q
    ? `Results for "${normalized.q}"`
    : normalized.sub
      ? "Browse"
      : normalized.category
        ? "Browse"
        : "All listings";

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <div className="md:hidden">
        <SearchBar initialQuery={normalized.q} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{heading}</h1>
          <p className="text-sm text-muted">{total} result{total === 1 ? "" : "s"}</p>
        </div>
        <SortSelect current={normalized.sort ?? "newest"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <FiltersSidebar brandFacets={brandFacets} />

        <div>
          {items.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <Frown size={32} className="text-muted" />
              <h2 className="text-lg font-semibold text-foreground">No results found</h2>
              <p className="max-w-sm text-sm text-muted">
                Try removing a filter, checking your spelling, or searching a broader term.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid listings={items} watchingIds={watchingIds} />
              <Pagination page={page} totalPages={totalPages} searchParams={rawParams} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
