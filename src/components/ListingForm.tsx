"use client";

import { useActionState, useState } from "react";
import { createListingAction, type ListingFormState } from "@/actions/listings";

const initialState: ListingFormState = {};

type Category = { id: string; name: string; parentId: string | null };

export default function ListingForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);
  const [listingType, setListingType] = useState<"FIXED_PRICE" | "AUCTION">("FIXED_PRICE");
  const [urlText, setUrlText] = useState("");

  const subcategories = categories.filter((c) => c.parentId);
  const topById = new Map(categories.filter((c) => !c.parentId).map((c) => [c.id, c.name]));

  const urlList = urlText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-bold text-foreground">Listing details</h2>

        <div>
          <label className="label">Title</label>
          <input name="title" required minLength={5} maxLength={120} placeholder="e.g. Apple AirPods Pro (2nd Gen)" className="input" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" required minLength={20} rows={5} placeholder="Describe the item's condition, features, and any flaws..." className="input" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select name="categoryId" required className="input">
              <option value="">Select a category</option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {topById.get(c.parentId!)} / {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select name="condition" required className="input">
              <option value="NEW">New</option>
              <option value="USED_LIKE_NEW">Like New</option>
              <option value="USED_GOOD">Good</option>
              <option value="USED_FAIR">Fair</option>
              <option value="FOR_PARTS">For Parts</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Brand (optional)</label>
            <input name="brand" maxLength={60} className="input" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" defaultValue="United States" required className="input" />
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-bold text-foreground">Photos</h2>
        <div>
          <label className="label">Upload images (JPEG/PNG/WEBP/GIF, up to 5MB each)</label>
          <input type="file" name="imageFiles" accept="image/*" multiple className="input" />
        </div>
        <div>
          <label className="label">Or paste image URLs (one per line)</label>
          <textarea
            rows={3}
            placeholder="https://picsum.photos/seed/my-item/900/700"
            className="input"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
          />
          {urlList.map((url) => (
            <input key={url} type="hidden" name="imageUrls" value={url} />
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-bold text-foreground">Pricing</h2>

        <div>
          <label className="label">Listing type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="listingType"
                value="FIXED_PRICE"
                checked={listingType === "FIXED_PRICE"}
                onChange={() => setListingType("FIXED_PRICE")}
                className="accent-[var(--brand)]"
              />
              Fixed price
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="listingType"
                value="AUCTION"
                checked={listingType === "AUCTION"}
                onChange={() => setListingType("AUCTION")}
                className="accent-[var(--brand)]"
              />
              Auction
            </label>
          </div>
        </div>

        {listingType === "FIXED_PRICE" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price (USD)</label>
              <input name="price" type="number" step="0.01" min="0.01" required className="input" />
            </div>
            <div>
              <label className="label">Quantity available</label>
              <input name="quantity" type="number" min="1" defaultValue={1} required className="input" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="hidden" name="price" value="0" />
            <div>
              <label className="label">Starting bid (USD)</label>
              <input name="startingBid" type="number" step="0.01" min="0.01" required className="input" />
            </div>
            <div>
              <label className="label">Bid increment (USD, optional)</label>
              <input name="bidIncrement" type="number" step="0.01" min="0.01" placeholder="Auto (5%)" className="input" />
            </div>
            <div>
              <label className="label">Buy It Now price (optional)</label>
              <input name="buyNowPrice" type="number" step="0.01" min="0.01" className="input" />
            </div>
            <div>
              <label className="label">Auction duration (hours)</label>
              <input name="auctionDurationHours" type="number" min="1" max="168" defaultValue={72} required className="input" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Shipping cost (USD)</label>
            <input name="shippingCost" type="number" step="0.01" min="0" defaultValue={0} className="input" />
          </div>
          <div>
            <label className="label">Estimated delivery (business days)</label>
            <input name="shippingEstimateDays" type="number" min="1" max="60" defaultValue={5} className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="freeShipping" className="accent-[var(--brand)]" />
          Offer free shipping
        </label>
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? "Publishing..." : "Publish listing"}
      </button>
    </form>
  );
}
