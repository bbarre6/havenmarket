import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * Confirms a pending order against Stripe and, if paid, applies the same
 * stock-decrement/cart-clear/status-flip logic the simulated flow used to do
 * synchronously. Safe to call more than once (from both the success-page
 * redirect and the webhook) — it's a no-op once the order is no longer
 * PENDING_PAYMENT.
 */
export async function finalizeStripeOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || !order.payment?.stripeSessionId) return;
  if (order.status !== "PENDING_PAYMENT") return;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(order.payment.stripeSessionId);
  if (session.payment_status !== "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const result = await tx.listing.updateMany({
          where: { id: item.listingId, quantityAvailable: { gte: item.quantity } },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
        if (result.count !== 1) {
          throw new Error(`STOCK_CONFLICT:${item.listingId}`);
        }
        const updated = await tx.listing.findUnique({ where: { id: item.listingId } });
        if (updated && updated.quantityAvailable <= 0) {
          await tx.listing.update({ where: { id: item.listingId }, data: { status: "SOLD" } });
        }
      }

      await tx.cartItem.deleteMany({
        where: { userId: order.buyerId, listingId: { in: order.items.map((i) => i.listingId) } },
      });

      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      await tx.payment.update({
        where: { orderId: order.id },
        data: { status: "PAID", stripePaymentIntentId: paymentIntentId },
      });
    });
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    await prisma.payment.update({ where: { orderId: order.id }, data: { status: "FAILED" } });
  }
}
