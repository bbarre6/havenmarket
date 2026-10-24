import Link from "next/link";
import { CATEGORY_TREE } from "@/lib/categories-data";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="text-xl font-extrabold">
            <span className="text-brand">Buy</span> Stuff
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            A demo online marketplace for buying, selling, and bidding on just about anything. Built as a fully
            working sample application.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {CATEGORY_TREE.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/search?category=${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Sell</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/sell" className="hover:text-brand">
                Create a listing
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-brand">
                Seller dashboard
              </Link>
            </li>
            <li>
              <Link href="/search?listingType=AUCTION" className="hover:text-brand">
                Run an auction
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/orders" className="hover:text-brand">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/account/watchlist" className="hover:text-brand">
                Watchlist
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-brand">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        Demo marketplace application — not a real store. Payments are simulated.
      </div>
    </footer>
  );
}
