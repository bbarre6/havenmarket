import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { computeTotals } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import CartItemRow from "@/components/CartItemRow";

export default async function CartPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <ShoppingCart size={32} className="text-muted" />
        <h1 className="text-lg font-semibold text-foreground">Sign in to view your cart</h1>
        <Link href="/login?callbackUrl=/cart" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { images: { orderBy: { position: "asc" }, take: 1 }, seller: { select: { name: true, storeName: true } } },
      },
    },
  });

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <ShoppingCart size={32} className="text-muted" />
        <h1 className="text-lg font-semibold text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted">Browse listings and add something you love.</p>
        <Link href="/search" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  const totals = computeTotals(
    items.map((i) => ({
      price: i.listing.price,
      quantity: i.quantity,
      shippingCost: i.listing.shippingCost,
      freeShipping: i.listing.freeShipping,
    }))
  );

  return (
    <div className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-4 text-xl font-bold text-foreground">Your cart ({items.length})</h1>
        <div className="card p-4">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="mb-4 text-base font-bold text-foreground">Order summary</h2>
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
          <Row label="Shipping" value={formatMoney(totals.shippingTotal)} />
          <Row label="Estimated tax" value={formatMoney(totals.taxTotal)} />
          <div className="my-2 border-t border-border" />
          <Row label="Total" value={formatMoney(totals.total)} bold />
        </div>
        <Link href="/checkout" className="btn btn-primary mt-4 w-full">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
