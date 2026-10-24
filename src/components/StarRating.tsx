import { Star } from "lucide-react";

export default function StarRating({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? "fill-accent text-accent" : "fill-none text-border"}
          />
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </span>
  );
}
