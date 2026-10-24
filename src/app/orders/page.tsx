import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { formatMoney } from "@/lib/money";

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "badge-gray",
  PAID: "badge-blue",
  SHIPPED: "badge-orange",
  DELIVERED: "badge-green",
  CANCELLED: "badge-red",
};

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sign in to view your orders</h1>
        <Link href="/login?callbackUrl=/orders" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { listing: { include: { images: { take: 1, orderBy: { position: "asc" } } } } } } },
  });

  if (orders.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <Package size={32} className="text-muted" />
        <h1 className="text-lg font-semibold text-foreground">No orders yet</h1>
        <Link href="/search" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-4 py-8">
      <h1 className="text-xl font-bold text-foreground">Your orders</h1>
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`} className="card flex flex-col gap-3 p-4 transition hover:shadow-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Order placed {new Date(order.createdAt).toLocaleDateString()} · {formatMoney(order.total)}
            </span>
            <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-gray"}`}>{order.status.replace("_", " ")}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {order.items.map((item) => {
              const img = item.listing.images[0]?.url;
              return (
                <div key={item.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {img && <Image src={img} alt={item.titleSnapshot} fill sizes="64px" className="object-cover" />}
                </div>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
