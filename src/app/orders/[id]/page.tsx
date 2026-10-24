import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { formatMoney } from "@/lib/money";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id, buyerId: user.id },
    include: {
      address: true,
      items: { include: { listing: { include: { images: { take: 1, orderBy: { position: "asc" } } } } } },
    },
  });

  if (!order) notFound();

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      {success === "1" && (
        <div className="card flex items-center gap-2 bg-green-50 p-4 text-sm font-medium text-success">
          <CheckCircle2 size={18} /> Order placed successfully! A confirmation has been added to your order history.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <span className="badge badge-blue">{order.status.replace("_", " ")}</span>
      </div>
      <p className="text-sm text-muted">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold text-foreground">Items</h2>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => {
              const img = item.listing.images[0]?.url;
              return (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                  <Link href={`/product/${item.listing.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {img && <Image src={img} alt={item.titleSnapshot} fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex-1">
                    <Link href={`/product/${item.listing.slug}`} className="text-sm font-medium text-foreground hover:text-brand">
                      {item.titleSnapshot}
                    </Link>
                    <p className="text-xs text-muted">Qty {item.quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{formatMoney(item.price * item.quantity)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">Summary</h2>
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Subtotal" value={formatMoney(order.subtotal)} />
              <Row label="Shipping" value={formatMoney(order.shippingTotal)} />
              <Row label="Tax" value={formatMoney(order.taxTotal)} />
              <div className="my-2 border-t border-border" />
              <Row label="Total" value={formatMoney(order.total)} bold />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="mb-2 text-base font-bold text-foreground">Shipping to</h2>
            <p className="text-sm text-muted">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.state} {order.address.postalCode}
            </p>
          </div>
        </div>
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
