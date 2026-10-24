import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";

type ReviewItem = {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  reviewer: { id: string; name: string };
};

export default function ReviewsSection({
  listingSlug,
  listingId,
  reviews,
  average,
  count,
  eligibleOrderId,
}: {
  listingSlug: string;
  listingId: string;
  reviews: ReviewItem[];
  average: number;
  count: number;
  eligibleOrderId: string | null;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-base font-bold text-foreground">Reviews</h2>
        {count > 0 && <StarRating rating={average} count={count} />}
      </div>

      {reviews.length === 0 && <p className="mb-3 text-sm text-muted">No reviews yet for this item.</p>}

      <ul className="mb-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-border pb-3 last:border-0">
            <div className="flex items-center gap-2">
              <StarRating rating={r.rating} size={13} />
              <span className="text-sm font-medium text-foreground">{r.title}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{r.body}</p>
            <p className="mt-1 text-xs text-muted">
              {r.reviewer.name} · {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {eligibleOrderId && <ReviewForm listingSlug={listingSlug} listingId={listingId} orderId={eligibleOrderId} />}
    </div>
  );
}
