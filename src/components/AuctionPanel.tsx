"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gavel, Zap } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { placeBidAction, buyNowAction } from "@/actions/auctions";
import CountdownTimer from "@/components/CountdownTimer";

type AuctionData = {
  id: string;
  status: "UPCOMING" | "LIVE" | "ENDED" | "SOLD";
  currentBid: number;
  startingBid: number;
  bidIncrement: number;
  buyNowPrice: number | null;
  startAt: string;
  endAt: string;
  winner: { id: string; name: string } | null;
};

type BidRow = { id: string; amount: number; createdAt: string; bidderName: string };

export default function AuctionPanel({
  listingSlug,
  initialAuction,
  initialBids,
  isOwnListing,
  isSignedIn,
  currentUserId,
}: {
  listingSlug: string;
  initialAuction: AuctionData;
  initialBids: BidRow[];
  isOwnListing: boolean;
  isSignedIn: boolean;
  currentUserId?: string;
}) {
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState(initialBids);
  const router = useRouter();

  const [amount, setAmount] = useState(String(initialAuction.currentBid + initialAuction.bidIncrement));
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidPending, startBidTransition] = useTransition();
  const [buyNowPending, setBuyNowPending] = useState(false);
  const [buyNowError, setBuyNowError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch(`/api/auctions/${auction.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setAuction((prev) => ({ ...prev, ...data }));
      setBids(data.bids ?? []);
    } catch {
      // ignore transient network errors; next poll will retry
    }
  }

  useEffect(() => {
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minNext = bids.length > 0 ? auction.currentBid + auction.bidIncrement : auction.startingBid;
  const isLive = auction.status === "LIVE";
  const hasEnded = auction.status === "ENDED" || auction.status === "SOLD";

  function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(false);
    const formData = new FormData();
    formData.set("auctionId", auction.id);
    formData.set("amount", amount);

    startBidTransition(async () => {
      const result = await placeBidAction(listingSlug, {}, formData);
      if (result.error) {
        setBidError(result.error);
        return;
      }
      setBidSuccess(true);
      if (result.currentBid) {
        setAuction((prev) => ({ ...prev, currentBid: result.currentBid! }));
        setAmount(String(result.currentBid + auction.bidIncrement));
      }
      await refresh();
    });
  }

  async function handleBuyNow() {
    setBuyNowError(null);
    setBuyNowPending(true);
    const result = await buyNowAction(listingSlug, auction.id);
    setBuyNowPending(false);
    if (result.error) {
      setBuyNowError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          {hasEnded ? "Winning bid" : "Current bid"}
        </div>
        <div className="text-3xl font-bold text-foreground">{formatMoney(auction.currentBid)}</div>
        <div className="text-sm text-muted">
          {bids.length} bid{bids.length === 1 ? "" : "s"}
          {auction.buyNowPrice && !hasEnded ? ` · Buy It Now: ${formatMoney(auction.buyNowPrice)}` : ""}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {auction.status === "UPCOMING" && (
          <span className="badge badge-blue">Starts {new Date(auction.startAt).toLocaleString()}</span>
        )}
        {isLive && (
          <span className="badge badge-red">
            <CountdownTimer endAt={auction.endAt} onExpire={refresh} />
          </span>
        )}
        {hasEnded && (
          <span className="badge badge-gray">
            <Gavel size={12} /> Auction ended{auction.winner ? ` · Won by ${auction.winner.name}` : " · No bids"}
          </span>
        )}
      </div>

      {hasEnded && auction.winner && currentUserId === auction.winner.id && (
        <div className="card flex flex-col gap-2 bg-brand-50 p-3 text-sm font-medium text-brand">
          🎉 You won this auction!
          <Link href={`/checkout/auction/${auction.id}`} className="btn btn-primary self-start">
            Complete purchase
          </Link>
        </div>
      )}

      {isLive && !isOwnListing && (
        <form onSubmit={handleBidSubmit} className="flex flex-col gap-2">
          <label className="label">Your bid (minimum {formatMoney(minNext)})</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="amount"
              step="0.01"
              min={minNext}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
            <button type="submit" disabled={bidPending} className="btn btn-primary shrink-0">
              <Gavel size={16} /> Place bid
            </button>
          </div>
          {bidError && <p className="text-sm text-danger">{bidError}</p>}
          {bidSuccess && <p className="text-sm text-success">Bid placed! You&apos;re the highest bidder.</p>}
        </form>
      )}

      {isLive && !isOwnListing && auction.buyNowPrice && (
        <div>
          <button onClick={handleBuyNow} disabled={buyNowPending} className="btn btn-accent w-full">
            <Zap size={16} /> Buy It Now — {formatMoney(auction.buyNowPrice)}
          </button>
          {buyNowError && <p className="mt-1 text-sm text-danger">{buyNowError}</p>}
        </div>
      )}

      {isLive && !isSignedIn && <p className="text-sm text-muted">Sign in to place a bid.</p>}
      {isOwnListing && <p className="text-sm text-muted">This is your own auction.</p>}

      {bids.length > 0 && (
        <div>
          <h4 className="label">Bid history</h4>
          <ul className="max-h-48 space-y-1.5 overflow-y-auto text-sm">
            {bids.map((b) => (
              <li key={b.id} className="flex justify-between border-b border-border py-1 last:border-0">
                <span className="text-foreground">{b.bidderName}</span>
                <span className="font-medium">{formatMoney(b.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
