"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { formatMoney } from "@/lib/money";

export default function BuyBox({
  listingId,
  price,
  quantityAvailable,
  isOwnListing,
  isSignedIn,
}: {
  listingId: string;
  price: number;
  quantityAvailable: number;
  isOwnListing: boolean;
  isSignedIn: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (isOwnListing) {
    return <p className="text-sm text-muted">This is your own listing.</p>;
  }

  if (quantityAvailable <= 0) {
    return <span className="badge badge-red w-fit">Out of stock</span>;
  }

  function handleAdd(redirectToCheckout: boolean) {
    setError(null);
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await addToCart(listingId, qty);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(redirectToCheckout ? "/checkout" : "/cart");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="label !mb-0">
          Qty
        </label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="input w-20"
        >
          {Array.from({ length: Math.min(quantityAvailable, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">{quantityAvailable} available</span>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button onClick={() => handleAdd(true)} disabled={pending} className="btn btn-accent w-full">
        <Zap size={16} /> Buy It Now — {formatMoney(price * qty)}
      </button>
      <button onClick={() => handleAdd(false)} disabled={pending} className="btn btn-secondary w-full">
        <ShoppingCart size={16} /> Add to Cart
      </button>
    </div>
  );
}
