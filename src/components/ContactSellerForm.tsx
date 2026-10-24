"use client";

import { useActionState, useState } from "react";
import { MessageCircle } from "lucide-react";
import { sendMessageAction, type SimpleFormState } from "@/actions/messages";

const initialState: SimpleFormState = {};

export default function ContactSellerForm({
  sellerId,
  listingId,
  isSignedIn,
}: {
  sellerId: string;
  listingId: string;
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);

  if (!isSignedIn) {
    return (
      <a href="/login" className="btn btn-secondary w-full">
        <MessageCircle size={16} /> Sign in to message seller
      </a>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-secondary w-full">
        <MessageCircle size={16} /> Contact seller
      </button>
    );
  }

  if (state.success) {
    return <p className="text-sm text-success">Message sent — check your inbox for replies.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="receiverId" value={sellerId} />
      <input type="hidden" name="listingId" value={listingId} />
      <textarea name="body" required minLength={1} rows={3} placeholder="Write your message..." className="input" />
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        Send message
      </button>
    </form>
  );
}
