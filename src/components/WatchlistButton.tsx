"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWatchlist } from "@/actions/watchlist";

export default function WatchlistButton({
  listingId,
  initialWatching,
  className = "",
  showLabel = false,
}: {
  listingId: string;
  initialWatching: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const [watching, setWatching] = useState(initialWatching);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const result = await toggleWatchlist(listingId);
        setWatching(result.watching);
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
      className={`flex items-center gap-1.5 rounded-full bg-surface/90 p-2 shadow-sm backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart size={16} className={watching ? "fill-accent text-accent" : "text-muted"} />
      {showLabel && <span className="text-sm font-medium">{watching ? "Watching" : "Watch"}</span>}
    </button>
  );
}
