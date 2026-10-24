import { describe, expect, it } from "vitest";
import { listingSchema, registerSchema, addressSchema } from "@/lib/validation";

describe("listingSchema", () => {
  const base = {
    title: "A perfectly fine title",
    description: "This description is definitely long enough to pass validation.",
    categoryId: "cat_1",
    condition: "NEW" as const,
    location: "United States",
    images: ["https://picsum.photos/seed/x/400/300"],
  };

  it("accepts a valid fixed-price listing without auction fields", () => {
    const result = listingSchema.safeParse({ ...base, listingType: "FIXED_PRICE", price: 25 });
    expect(result.success).toBe(true);
  });

  it("rejects a fixed-price listing with a zero or missing price", () => {
    const result = listingSchema.safeParse({ ...base, listingType: "FIXED_PRICE", price: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts a valid auction listing with no fixed price supplied", () => {
    const result = listingSchema.safeParse({
      ...base,
      listingType: "AUCTION",
      price: 0,
      startingBid: 10,
      auctionDurationHours: 48,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an auction listing missing a starting bid", () => {
    const result = listingSchema.safeParse({ ...base, listingType: "AUCTION", price: 0, auctionDurationHours: 48 });
    expect(result.success).toBe(false);
  });

  it("rejects a buy-now price that doesn't exceed the starting bid", () => {
    const result = listingSchema.safeParse({
      ...base,
      listingType: "AUCTION",
      price: 0,
      startingBid: 50,
      buyNowPrice: 50,
      auctionDurationHours: 48,
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({ name: "Jamie", email: "jamie@test.local", password: "short" });
    expect(result.success).toBe(false);
  });

  it("normalizes email to lowercase", () => {
    const result = registerSchema.safeParse({ name: "Jamie", email: "JAMIE@Test.Local", password: "password123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jamie@test.local");
  });
});

describe("addressSchema", () => {
  it("requires the core shipping fields", () => {
    const result = addressSchema.safeParse({ fullName: "Jamie", line1: "", city: "Austin", state: "TX", postalCode: "78701" });
    expect(result.success).toBe(false);
  });
});
