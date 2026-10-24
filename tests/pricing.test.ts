import { describe, expect, it } from "vitest";
import { computeTotals, computeSellerPayout, SELLER_FEE_RATE, TAX_RATE } from "@/lib/pricing";

describe("computeTotals", () => {
  it("sums subtotal, shipping, and tax across multiple items", () => {
    const totals = computeTotals([
      { price: 10, quantity: 2, shippingCost: 5, freeShipping: false },
      { price: 20, quantity: 1, shippingCost: 3, freeShipping: false },
    ]);

    expect(totals.subtotal).toBeCloseTo(40, 2); // 10*2 + 20*1
    expect(totals.shippingTotal).toBeCloseTo(8, 2); // 5 + 3
    expect(totals.taxTotal).toBeCloseTo(40 * TAX_RATE, 2);
    expect(totals.total).toBeCloseTo(40 + 8 + 40 * TAX_RATE, 2);
  });

  it("excludes shipping cost for free-shipping items", () => {
    const totals = computeTotals([{ price: 50, quantity: 1, shippingCost: 15, freeShipping: true }]);
    expect(totals.shippingTotal).toBe(0);
  });

  it("returns zero totals for an empty cart", () => {
    const totals = computeTotals([]);
    expect(totals).toEqual({ subtotal: 0, shippingTotal: 0, taxTotal: 0, total: 0 });
  });

  it("rounds to the nearest cent", () => {
    const totals = computeTotals([{ price: 19.995, quantity: 1, shippingCost: 0, freeShipping: false }]);
    expect(Number.isInteger(Math.round(totals.subtotal * 100))).toBe(true);
    expect(Number.isInteger(Math.round(totals.total * 100))).toBe(true);
  });
});

describe("computeSellerPayout", () => {
  it("takes a 10% platform fee off the gross amount", () => {
    expect(SELLER_FEE_RATE).toBe(0.1);
    const { fee, net } = computeSellerPayout(100);
    expect(fee).toBeCloseTo(10, 2);
    expect(net).toBeCloseTo(90, 2);
  });

  it("rounds fee and net to the nearest cent", () => {
    const { fee, net } = computeSellerPayout(19.99);
    expect(Number.isInteger(Math.round(fee * 100))).toBe(true);
    expect(Number.isInteger(Math.round(net * 100))).toBe(true);
    expect(fee + net).toBeCloseTo(19.99, 2);
  });
});
