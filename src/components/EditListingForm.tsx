"use client";

import { useActionState } from "react";
import { updateListingAction, type ListingFormState } from "@/actions/listings";

const initialState: ListingFormState = {};

type Category = { id: string; name: string; parentId: string | null };

export default function EditListingForm({
  listing,
  categories,
}: {
  listing: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    condition: string;
    brand: string | null;
    location: string;
    listingType: string;
    price: number;
    quantity: number;
    shippingCost: number;
    freeShipping: boolean;
    shippingEstimateDays: number;
    images: { url: string }[];
  };
  categories: Category[];
}) {
  const action = updateListingAction.bind(null, listing.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const subcategories = categories.filter((c) => c.parentId);
  const topById = new Map(categories.filter((c) => !c.parentId).map((c) => [c.id, c.name]));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="listingType" value={listing.listingType} />
      {listing.images.map((img) => (
        <input key={img.url} type="hidden" name="imageUrls" value={img.url} />
      ))}

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-bold text-foreground">Listing details</h2>
        <div>
          <label className="label">Title</label>
          <input name="title" defaultValue={listing.title} required minLength={5} maxLength={120} className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" defaultValue={listing.description} required minLength={20} rows={5} className="input" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select name="categoryId" defaultValue={listing.categoryId} required className="input">
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {topById.get(c.parentId!)} / {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select name="condition" defaultValue={listing.condition} required className="input">
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
            <label className="label">Brand</label>
            <input name="brand" defaultValue={listing.brand ?? ""} maxLength={60} className="input" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" defaultValue={listing.location} required className="input" />
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-bold text-foreground">Pricing &amp; shipping</h2>
        {listing.listingType === "FIXED_PRICE" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price (USD)</label>
              <input name="price" type="number" step="0.01" min="0.01" defaultValue={listing.price} required className="input" />
            </div>
            <div>
              <label className="label">Quantity available</label>
              <input name="quantity" type="number" min="1" defaultValue={listing.quantity} required className="input" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Auction pricing can&apos;t be changed after the listing is created.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Shipping cost (USD)</label>
            <input name="shippingCost" type="number" step="0.01" min="0" defaultValue={listing.shippingCost} className="input" />
          </div>
          <div>
            <label className="label">Estimated delivery (business days)</label>
            <input name="shippingEstimateDays" type="number" min="1" max="60" defaultValue={listing.shippingEstimateDays} className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="freeShipping" defaultChecked={listing.freeShipping} className="accent-[var(--brand)]" />
          Offer free shipping
        </label>
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
