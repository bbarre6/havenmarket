"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, X } from "lucide-react";
import { updateReportStatusAction, removeReportedListingAction } from "@/actions/admin";

export default function ReportActions({
  reportId,
  listingId,
  status,
  listingDeleted,
}: {
  reportId: string;
  listingId: string;
  status: string;
  listingDeleted: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not update report.");
      }
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <span className="badge badge-gray">{status}</span>
      <div className="flex gap-1.5">
        {!listingDeleted && (
          <button
            disabled={pending}
            onClick={() => run(() => removeReportedListingAction(reportId, listingId))}
            className="btn btn-secondary text-xs text-red-600"
          >
            <Trash2 size={13} /> Remove listing
          </button>
        )}
        {status === "OPEN" && (
          <>
            <button
              disabled={pending}
              onClick={() => run(() => updateReportStatusAction(reportId, "REVIEWED"))}
              className="btn btn-secondary text-xs"
            >
              <Eye size={13} /> Mark reviewed
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => updateReportStatusAction(reportId, "DISMISSED"))}
              className="btn btn-secondary text-xs"
            >
              <X size={13} /> Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
