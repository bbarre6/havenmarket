export const TAX_RATE = 0.0825;

export const SELLER_FEE_RATE = 0.1;

export function computeSellerPayout(grossAmount: number) {
  const fee = Math.round(grossAmount * SELLER_FEE_RATE * 100) / 100;
  const net = Math.round((grossAmount - fee) * 100) / 100;
  return { fee, net };
}

export function computeTotals(
  items: { price: number; quantity: number; shippingCost: number; freeShipping: boolean }[]
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingTotal = items.reduce((sum, i) => sum + (i.freeShipping ? 0 : i.shippingCost), 0);
  const taxTotal = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingTotal + taxTotal) * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingTotal: Math.round(shippingTotal * 100) / 100,
    taxTotal,
    total,
  };
}
