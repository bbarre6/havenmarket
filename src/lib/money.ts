const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(amount: number): string {
  return currencyFormatter.format(amount);
}

export function round2(amount: number): number {
  return Math.round(amount * 100) / 100;
}
