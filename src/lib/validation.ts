import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(60),
  state: z.string().trim().min(1).max(60),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(60).default("United States"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
});

export const listingSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
    description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
    categoryId: z.string().min(1, "Choose a category"),
    condition: z.enum(["NEW", "USED_LIKE_NEW", "USED_GOOD", "USED_FAIR", "FOR_PARTS"]),
    brand: z.string().trim().max(60).optional().or(z.literal("")),
    location: z.string().trim().min(2).max(80).default("United States"),
    listingType: z.enum(["FIXED_PRICE", "AUCTION"]),
    price: z.coerce.number().min(0).default(0),
    quantity: z.coerce.number().int().min(1).max(10000).default(1),
    shippingCost: z.coerce.number().min(0).max(10000).default(0),
    freeShipping: z.coerce.boolean().optional().default(false),
    shippingEstimateDays: z.coerce.number().int().min(1).max(60).default(5),
    images: z.array(z.string().url()).min(1, "Add at least one image").max(10),
    auctionDurationHours: z.coerce.number().int().min(1).max(168).optional(),
    startingBid: z.coerce.number().positive().optional(),
    bidIncrement: z.coerce.number().positive().optional(),
    buyNowPrice: z.coerce.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === "FIXED_PRICE" && data.price <= 0) {
      ctx.addIssue({ code: "custom", message: "Price must be greater than 0", path: ["price"] });
    }
    if (data.listingType === "AUCTION") {
      if (!data.startingBid) {
        ctx.addIssue({ code: "custom", message: "Starting bid is required for auctions", path: ["startingBid"] });
      }
      if (!data.auctionDurationHours) {
        ctx.addIssue({ code: "custom", message: "Auction duration is required", path: ["auctionDurationHours"] });
      }
      if (data.buyNowPrice && data.startingBid && data.buyNowPrice <= data.startingBid) {
        ctx.addIssue({ code: "custom", message: "Buy-it-now price must exceed the starting bid", path: ["buyNowPrice"] });
      }
    }
  });

export const bidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Select a shipping address"),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  listingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(2).max(100),
  body: z.string().trim().min(5).max(2000),
});

export const questionSchema = z.object({
  listingId: z.string().min(1),
  question: z.string().trim().min(5).max(500),
});

export const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().trim().min(1).max(1000),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  listingId: z.string().optional(),
  body: z.string().trim().min(1).max(2000),
});

export const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.string().trim().min(2).max(100),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});
