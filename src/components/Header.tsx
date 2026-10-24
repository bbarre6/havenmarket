import Link from "next/link";
import { Heart, ShoppingCart, Tag, Gavel } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { getCartCount, getWatchlistCount } from "@/lib/cart";
import SearchBar from "@/components/SearchBar";
import AccountMenu from "@/components/AccountMenu";
import CategoryNav from "@/components/CategoryNav";

export default async function Header() {
  const user = await getSessionUser();
  const [cartCount, watchCount] = await Promise.all([
    getCartCount(user?.id),
    getWatchlistCount(user?.id),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight">
          <span className="text-brand">Buy</span>
          <span className="text-foreground"> Stuff</span>
        </Link>

        <div className="hidden flex-1 md:flex">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/search?listingType=AUCTION&sort=ending-soon"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-surface-muted lg:flex"
          >
            <Gavel size={16} /> Auctions
          </Link>
          <Link
            href="/search?sort=newest&deals=1"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-surface-muted lg:flex"
          >
            <Tag size={16} /> Deals
          </Link>
          <Link
            href="/account/watchlist"
            className="relative flex items-center rounded-lg p-2 text-foreground hover:bg-surface-muted"
            aria-label="Watchlist"
          >
            <Heart size={20} />
            {watchCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {watchCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center rounded-lg p-2 text-foreground hover:bg-surface-muted"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <AccountMenu user={user} />
        </nav>
      </div>
      <div className="border-t border-border px-0 py-2 md:hidden">
        <div className="container-page">
          <SearchBar />
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}
