"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction, type ReviewFormState } from "@/actions/reviews";

const initialState: ReviewFormState = {};

export default function ReviewForm({ listingSlug, listingId, orderId }: { listingSlug: string; listingId: string; orderId: string }) {
  const action = submitReviewAction.bind(null, listingSlug);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rating, setRating] = useState(5);

  if (state.success) {
    return <p className="text-sm text-success">Thanks for your review!</p>;
  }

  return (
    <form action={formAction} className="card flex flex-col gap-2 p-4">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      <h3 className="text-sm font-semibold text-foreground">Write a review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)}>
            <Star size={20} className={i <= rating ? "fill-accent text-accent" : "text-border"} />
          </button>
        ))}
      </div>
      <input name="title" required placeholder="Review title" className="input" />
      <textarea name="body" required rows={3} placeholder="Share details about your purchase..." className="input" />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        Submit review
      </button>
    </form>
  );
}
