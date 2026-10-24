"use client";

import { useActionState } from "react";
import { askQuestionAction, type SimpleFormState } from "@/actions/questions";

const initialState: SimpleFormState = {};

export default function AskQuestionForm({ listingSlug, listingId }: { listingSlug: string; listingId: string }) {
  const action = askQuestionAction.bind(null, listingSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="listingId" value={listingId} />
      <textarea
        name="question"
        required
        minLength={5}
        rows={2}
        placeholder="Ask the seller a question..."
        className="input"
      />
      <div className="flex items-center justify-between">
        {state.error && <p className="text-xs text-danger">{state.error}</p>}
        {state.success && <p className="text-xs text-success">Question sent to the seller.</p>}
        <button type="submit" disabled={pending} className="btn btn-secondary ml-auto">
          Ask question
        </button>
      </div>
    </form>
  );
}
