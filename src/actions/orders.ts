"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { computeTotals } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/validation";
import { getStripe, getSiteUrl, isStripeConfigured } from "@/lib/stripe";
import type Stripe from "stripe";

type Totals = { subtotal: number; shippingTotal: number; taxTotal: number; total: number };

function buildStripeLineItems(
  cartLines: { name: string; price: number; quantity: number }[],
  totals: Totals
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartLines.map((line) => ({
    price_data: {
      currency: "usd",
      product_data: { name: line.name },
      unit_amount: Math.round(line.price * 100),
    },
    quantity: line.quantity,
  }));

  if (totals.shippingTotal > 0) {
    lineItems.push({
      price_data: { currency: "usd", product_data: { name: "Shipping" }, unit_amount: Math.round(totals.shippingTotal * 100) },
      quantity: 1,
    });
  }
  if (totals.taxTotal > 0) {
    lineItems.push({
      price_data: { currency: "usd", product_data: { name: "Estimated tax" }, unit_amount: Math.round(totals.taxTotal * 100) },
      quantity: 1,
    });
  }

  return lineItems;
}

async function startStripeCheckout(
  orderId: string,
  userEmail: string | null | undefined,
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  cancelPath: string
) {
  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: userEmail ?? undefined,
    metadata: { orderId },
    success_url: `${siteUrl}/orders/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${cancelPath}`,
  });

  await prisma.payment.update({ where: { orderId }, data: { stripeSessionId: session.id } });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}

const NEXT_STATUS: Record<string, "SHIPPED" | "DELIVERED" | undefined> = {
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function advanceOrderStatusAction(orderId: string) {
  const user = await requireUser();

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("Order not found.");

  const isParticipantSeller = order.items.some((item) => item.sellerId === user.id);
  if (!isParticipantSeller) {
    throw new Error("You can only update orders containing your own listings.");
  }

  const nextStatus = NEXT_STATUS[order.status];
  if (!nextStatus) {
    throw new Error(`Order is already ${order.status.toLowerCase().replace("_", " ")}.`);
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

export type CheckoutFormState = { error?: string };

export async function placeOrderAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const user = await requireUser();

  const parsed = checkoutSchema.safeParse({ addressId: formData.get("addressId") });
  if (!parsed.success) {
    return { error: "Select a shipping address." };
  }

  const address = await prisma.address.findFirst({ where: { id: parsed.data.addressId, userId: user.id } });
  if (!address) {
    return { error: "That address could not be found." };
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { listing: true },
  });

  if (cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Re-validate every price and stock level server-side — never trust anything from the client.
  for (const item of cartItems) {
    if (item.listing.status !== "ACTIVE") {
      return { error: `"${item.listing.title}" is no longer available.` };
    }
    if (item.quantity > item.listing.quantityAvailable) {
      return { error: `Only ${item.listing.quantityAvailable} of "${item.listing.title}" left in stock.` };
    }
  }

  const totals = computeTotals(
    cartItems.map((i) => ({
      price: i.listing.price,
      quantity: i.quantity,
      shippingCost: i.listing.shippingCost,
      freeShipping: i.listing.freeShipping,
    }))
  );

  if (isStripeConfigured()) {
    const pendingOrder = await prisma.order.create({
      data: {
        buyerId: user.id,
        addressId: address.id,
        status: "PENDING_PAYMENT",
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: cartItems.map((i) => ({
            listingId: i.listingId,
            sellerId: i.listing.sellerId,
            titleSnapshot: i.listing.title,
            price: i.listing.price,
            quantity: i.quantity,
            shippingCost: i.listing.freeShipping ? 0 : i.listing.shippingCost,
          })),
        },
        payment: {
          create: { provider: "STRIPE", amountCents: Math.round(totals.total * 100), status: "PENDING" },
        },
      },
    });

    const lineItems = buildStripeLineItems(
      cartItems.map((i) => ({ name: i.listing.title, price: i.listing.price, quantity: i.quantity })),
      totals
    );
    await startStripeCheckout(pendingOrder.id, user.email, lineItems, "/checkout?canceled=1");
    return {};
  }

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId: user.id,
        addressId: address.id,
        status: "PAID",
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: cartItems.map((i) => ({
            listingId: i.listingId,
            sellerId: i.listing.sellerId,
            titleSnapshot: i.listing.title,
            price: i.listing.price,
            quantity: i.quantity,
            shippingCost: i.listing.freeShipping ? 0 : i.listing.shippingCost,
          })),
        },
        payment: {
          create: {
            provider: "SIMULATED",
            amountCents: Math.round(totals.total * 100),
            status: "SIMULATED_PAID",
          },
        },
      },
    });

    for (const item of cartItems) {
      const result = await tx.listing.updateMany({
        where: { id: item.listingId, quantityAvailable: { gte: item.quantity } },
        data: { quantityAvailable: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        throw new Error(`STOCK_CONFLICT:${item.listing.title}`);
      }
      const updated = await tx.listing.findUnique({ where: { id: item.listingId } });
      if (updated && updated.quantityAvailable <= 0) {
        await tx.listing.update({ where: { id: item.listingId }, data: { status: "SOLD" } });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return created;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    if (message.startsWith("STOCK_CONFLICT:")) {
      return { error: `"${message.split(":")[1]}" just sold out. Please update your cart.` };
    }
    return { error: "Something went wrong placing your order. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}?success=1`);
}

export async function payForWonAuctionAction(
  auctionId: string,
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const user = await requireUser();

  const parsed = checkoutSchema.safeParse({ addressId: formData.get("addressId") });
  if (!parsed.success) {
    return { error: "Select a shipping address." };
  }

  const address = await prisma.address.findFirst({ where: { id: parsed.data.addressId, userId: user.id } });
  if (!address) {
    return { error: "That address could not be found." };
  }

  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
  if (!auction) return { error: "Auction not found." };
  if (auction.winnerId !== user.id) return { error: "You did not win this auction." };

  const existing = await prisma.orderItem.findFirst({
    where: { listingId: auction.listingId, order: { buyerId: user.id } },
  });
  if (existing) {
    redirect(`/orders/${existing.orderId}`);
  }

  const totals = computeTotals([
    {
      price: auction.currentBid,
      quantity: 1,
      shippingCost: auction.listing.shippingCost,
      freeShipping: auction.listing.freeShipping,
    },
  ]);

  if (isStripeConfigured()) {
    const pendingOrder = await prisma.order.create({
      data: {
        buyerId: user.id,
        addressId: address.id,
        status: "PENDING_PAYMENT",
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: [
            {
              listingId: auction.listingId,
              sellerId: auction.listing.sellerId,
              titleSnapshot: auction.listing.title,
              price: auction.currentBid,
              quantity: 1,
              shippingCost: auction.listing.freeShipping ? 0 : auction.listing.shippingCost,
            },
          ],
        },
        payment: {
          create: { provider: "STRIPE", amountCents: Math.round(totals.total * 100), status: "PENDING" },
        },
      },
    });

    const lineItems = buildStripeLineItems([{ name: auction.listing.title, price: auction.currentBid, quantity: 1 }], totals);
    await startStripeCheckout(pendingOrder.id, user.email, lineItems, `/checkout/auction/${auctionId}?canceled=1`);
    return {};
  }

  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      addressId: address.id,
      status: "PAID",
      subtotal: totals.subtotal,
      shippingTotal: totals.shippingTotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      items: {
        create: [
          {
            listingId: auction.listingId,
            sellerId: auction.listing.sellerId,
            titleSnapshot: auction.listing.title,
            price: auction.currentBid,
            quantity: 1,
            shippingCost: auction.listing.freeShipping ? 0 : auction.listing.shippingCost,
          },
        ],
      },
      payment: {
        create: { provider: "SIMULATED", amountCents: Math.round(totals.total * 100), status: "SIMULATED_PAID" },
      },
    },
  });

  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}?success=1`);
}
