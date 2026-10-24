"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pause, Play, Pencil, Trash2 } from "lucide-react";
import { setListingStatusAction } from "@/actions/listings";

export default function ListingRowActions({
  listingId,
  status,
  listingType,
}: {
  listingId: string;
  status: string;
  listingType: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function updateStatus(status: "ACTIVE" | "PAUSED" | "DELETED") {
    startTransition(async () => {
      try {
        await setListingStatusAction(listingId, status);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not update listing.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/listings/${listingId}/edit`} className="flex items-center gap-1 text-xs text-brand hover:underline">
        <Pencil size={13} /> Edit
      </Link>
      {listingType === "FIXED_PRICE" && status === "ACTIVE" && (
        <button disabled={pending} onClick={() => updateStatus("PAUSED")} className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
          <Pause size={13} /> Pause
        </button>
      )}
      {listingType === "FIXED_PRICE" && status === "PAUSED" && (
        <button disabled={pending} onClick={() => updateStatus("ACTIVE")} className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
          <Play size={13} /> Resume
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this listing? This cannot be undone.")) updateStatus("DELETED");
        }}
        className="flex items-center gap-1 text-xs text-danger hover:underline"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}
