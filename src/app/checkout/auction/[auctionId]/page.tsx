import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserForPage } from "@/lib/auth-helpers";
import { computeTotals } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import WonAuctionCheckoutForm from "@/components/WonAuctionCheckoutForm";
import { formatMoney } from "@/lib/money";

export default async function WonAuctionCheckoutPage({ params }: { params: Promise<{ auctionId: string }> }) {
  const { auctionId } = await params;
  const user = await requireUserForPage(`/checkout/auction/${auctionId}`);

  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
  if (!auction || auction.winnerId !== user.id) notFound();

  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });

  const totals = computeTotals([
    {
      price: auction.currentBid,
      quantity: 1,
      shippingCost: auction.listing.shippingCost,
      freeShipping: auction.listing.freeShipping,
    },
  ]);

  return (
    <div className="container-page max-w-xl py-8">
      <h1 className="mb-1 text-xl font-bold text-foreground">Complete your purchase</h1>
      <p className="mb-6 text-sm text-muted">
        You won <strong>{auction.listing.title}</strong> for {formatMoney(auction.currentBid)}.
      </p>
      <div className="card mb-4 p-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>Winning bid</span>
          <span>{formatMoney(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Shipping</span>
          <span>{formatMoney(totals.shippingTotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Tax</span>
          <span>{formatMoney(totals.taxTotal)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
          <span>Total</span>
          <span>{formatMoney(totals.total)}</span>
        </div>
      </div>
      <WonAuctionCheckoutForm
        auctionId={auction.id}
        addresses={addresses}
        total={totals.total}
        stripeEnabled={isStripeConfigured()}
      />
    </div>
  );
}
