import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { computeTotals } from "@/lib/pricing";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sign in to checkout</h1>
        <Link href="/login?callbackUrl=/checkout" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const [cartItems, addresses] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId: user.id }, include: { listing: true } }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
  ]);

  if (cartItems.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Your cart is empty</h1>
        <Link href="/search" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  const totals = computeTotals(
    cartItems.map((i) => ({
      price: i.listing.price,
      quantity: i.quantity,
      shippingCost: i.listing.shippingCost,
      freeShipping: i.listing.freeShipping,
    }))
  );

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-xl font-bold text-foreground">Checkout</h1>
      <CheckoutForm addresses={addresses} totals={totals} />
    </div>
  );
}
