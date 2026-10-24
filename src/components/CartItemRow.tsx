"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { updateCartQuantity, removeCartItem } from "@/actions/cart";
import { formatMoney } from "@/lib/money";

export default function CartItemRow({
  item,
}: {
  item: {
    id: string;
    quantity: number;
    listing: {
      slug: string;
      title: string;
      price: number;
      shippingCost: number;
      freeShipping: boolean;
      quantityAvailable: number;
      images: { url: string }[];
      seller: { name: string; storeName: string | null };
    };
  };
}) {
  const [qty, setQty] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleQtyChange(next: number) {
    setQty(next);
    setError(null);
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCartItem(item.id);
      router.refresh();
    });
  }

  const image = item.listing.images[0]?.url;

  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <Link href={`/product/${item.listing.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {image && <Image src={image} alt={item.listing.title} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <Link href={`/product/${item.listing.slug}`} className="text-sm font-medium text-foreground hover:text-brand">
          {item.listing.title}
        </Link>
        <p className="text-xs text-muted">Sold by {item.listing.seller.storeName || item.listing.seller.name}</p>
        <p className="text-xs text-muted">
          {item.listing.freeShipping || item.listing.shippingCost === 0
            ? "Free shipping"
            : `+${formatMoney(item.listing.shippingCost)} shipping`}
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="mt-auto flex items-center gap-3">
          <select
            value={qty}
            disabled={pending}
            onChange={(e) => handleQtyChange(Number(e.target.value))}
            className="input w-20"
          >
            {Array.from({ length: Math.max(item.listing.quantityAvailable, item.quantity) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button onClick={handleRemove} disabled={pending} className="flex items-center gap-1 text-xs text-muted hover:text-danger">
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
      <div className="text-right text-sm font-semibold text-foreground">{formatMoney(item.listing.price * qty)}</div>
    </div>
  );
}
