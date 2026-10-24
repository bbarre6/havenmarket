"use client";

import { useActionState } from "react";
import { answerQuestionAction, type SimpleFormState } from "@/actions/questions";

const initialState: SimpleFormState = {};

export default function AnswerForm({ listingSlug, questionId }: { listingSlug: string; questionId: string }) {
  const action = answerQuestionAction.bind(null, listingSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return <p className="text-xs text-success">Answer posted.</p>;
  }

  return (
    <form action={formAction} className="mt-1 flex gap-2">
      <input type="hidden" name="questionId" value={questionId} />
      <input name="answer" required placeholder="Write a reply..." className="input text-sm" />
      <button type="submit" disabled={pending} className="btn btn-secondary shrink-0 text-xs">
        Reply
      </button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
