"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { reportListingAction, type SimpleFormState } from "@/actions/reports";

const initialState: SimpleFormState = {};

export default function ReportListingButton({ listingId, isSignedIn }: { listingId: string; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reportListingAction, initialState);

  if (!isSignedIn) return null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs text-muted hover:text-danger">
        <Flag size={12} /> Report this listing
      </button>
    );
  }

  if (state.success) {
    return <p className="text-xs text-success">Report submitted. Our team will review it.</p>;
  }

  return (
    <form action={formAction} className="card flex flex-col gap-2 p-3">
      <input type="hidden" name="listingId" value={listingId} />
      <select name="reason" required className="input text-sm">
        <option value="">Select a reason</option>
        <option value="Counterfeit item">Counterfeit item</option>
        <option value="Prohibited item">Prohibited item</option>
        <option value="Misleading description">Misleading description</option>
        <option value="Suspicious seller">Suspicious seller</option>
        <option value="Other">Other</option>
      </select>
      <textarea name="details" rows={2} placeholder="Additional details (optional)" className="input text-sm" />
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-danger-outline text-xs">
          Submit report
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}
