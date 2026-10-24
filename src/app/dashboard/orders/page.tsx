import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { getSellerOrderItems } from "@/lib/seller";
import { formatMoney } from "@/lib/money";
import { computeSellerPayout } from "@/lib/pricing";
import AdvanceOrderButton from "@/components/AdvanceOrderButton";

export default async function DashboardOrdersPage() {
  const user = await requireUser();
  const orderItems = await getSellerOrderItems(user.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Sales &amp; orders</h2>
      {orderItems.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No sales yet.</div>
      ) : (
        <div className="card divide-y divide-border">
          {orderItems.map((item) => {
            const img = item.listing.images[0]?.url;
            const itemTotal = item.price * item.quantity;
            const { net } = computeSellerPayout(itemTotal);
            return (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {img && <Image src={img} alt={item.titleSnapshot} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.listing.slug}`} className="block truncate text-sm font-medium text-foreground hover:text-brand">
                    {item.titleSnapshot}
                  </Link>
                  <p className="text-xs text-muted">
                    Buyer: {item.order.buyer.name} · Qty {item.quantity} · {new Date(item.order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted">
                    Ship to: {item.order.address.city}, {item.order.address.state} {item.order.address.postalCode}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-foreground">{formatMoney(itemTotal)}</div>
                  <div className="text-xs text-muted">You get {formatMoney(net)} (10% fee)</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="badge badge-blue">{item.order.status.replace("_", " ")}</span>
                  <AdvanceOrderButton orderId={item.orderId} status={item.order.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
