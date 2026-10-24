"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction, type SimpleFormState } from "@/actions/messages";
import { markThreadRead } from "@/actions/messages";

const initialState: SimpleFormState = {};

type MessageItem = {
  id: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string };
};

export default function MessageThread({
  partnerId,
  currentUserId,
  messages,
}: {
  partnerId: string;
  currentUserId: string;
  messages: MessageItem[];
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markThreadRead(partnerId);
  }, [partnerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, state.success]);

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.sender.id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-brand text-white" : "bg-surface-muted text-foreground"}`}>
                  {m.body}
                  <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
      <form action={formAction} className="flex gap-2 border-t border-border p-3">
        <input type="hidden" name="receiverId" value={partnerId} />
        <input name="body" required placeholder="Type a message..." className="input" autoComplete="off" />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
          Send
        </button>
      </form>
      {state.error && <p className="px-3 pb-2 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
