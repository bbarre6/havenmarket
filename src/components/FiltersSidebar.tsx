"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { conditionLabel } from "@/lib/format";

const CONDITIONS = ["NEW", "USED_LIKE_NEW", "USED_GOOD", "USED_FAIR", "FOR_PARTS"];

export default function FiltersSidebar({ brandFacets }: { brandFacets: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  const activeConditions = new Set(searchParams.getAll("condition"));
  const activeBrands = new Set(searchParams.getAll("brand"));
  const listingType = searchParams.get("listingType") ?? "";
  const freeShipping = searchParams.get("freeShipping") === "1";

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  }

  function toggleMultiValue(key: string, value: string) {
    updateParams((params) => {
      const values = params.getAll(key).filter((v) => v !== value);
      const isActive = params.getAll(key).includes(value);
      params.delete(key);
      const next = isActive ? values : [...values, value];
      next.forEach((v) => params.append(key, v));
    });
  }

  function applyPriceAndLocation() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
      if (location) params.set("location", location);
      else params.delete("location");
    });
  }

  function setListingType(value: string) {
    updateParams((params) => {
      if (value) params.set("listingType", value);
      else params.delete("listingType");
    });
  }

  function toggleFreeShipping() {
    updateParams((params) => {
      if (freeShipping) params.delete("freeShipping");
      else params.set("freeShipping", "1");
    });
  }

  function clearAll() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const sub = searchParams.get("sub");
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sub) params.set("sub", sub);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <aside className="card flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Filters</h3>
        <button onClick={clearAll} className="text-xs font-medium text-brand hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <h4 className="label">Listing type</h4>
        <div className="space-y-1.5">
          {[
            { value: "", label: "All listings" },
            { value: "FIXED_PRICE", label: "Buy It Now" },
            { value: "AUCTION", label: "Auction" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="listingType"
                checked={listingType === opt.value}
                onChange={() => setListingType(opt.value)}
                className="accent-[var(--brand)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="label">Price</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceAndLocation}
            className="input"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceAndLocation}
            className="input"
          />
        </div>
      </div>

      <div>
        <h4 className="label">Condition</h4>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={activeConditions.has(c)}
                onChange={() => toggleMultiValue("condition", c)}
                className="accent-[var(--brand)]"
              />
              {conditionLabel(c)}
            </label>
          ))}
        </div>
      </div>

      {brandFacets.length > 0 && (
        <div>
          <h4 className="label">Brand</h4>
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {brandFacets.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={activeBrands.has(b)}
                  onChange={() => toggleMultiValue("brand", b)}
                  className="accent-[var(--brand)]"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="label">Location</h4>
        <input
          type="text"
          placeholder="City or state"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onBlur={applyPriceAndLocation}
          className="input"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={freeShipping} onChange={toggleFreeShipping} className="accent-[var(--brand)]" />
        Free shipping only
      </label>
    </aside>
  );
}
