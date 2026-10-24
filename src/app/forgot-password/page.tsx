"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type RequestResetState } from "@/actions/password-reset";

const initialState: RequestResetState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Reset your password</h1>
        <p className="mb-6 text-sm text-muted">
          Enter your account email. Email delivery isn&apos;t connected yet — your reset link is generated on screen
          instead.
        </p>
        <form action={formAction} className="flex flex-col gap-4">
          <input name="email" type="email" required placeholder="you@example.com" className="input" />
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            Send reset link
          </button>
        </form>
        {state.info && <p className="mt-4 text-sm text-muted">{state.info}</p>}
        {state.resetLink && (
          <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3 text-sm">
            <p className="mb-1 font-medium text-foreground">Your reset link (will be emailed once email delivery is connected):</p>
            <Link href={state.resetLink} className="break-all text-brand hover:underline">
              {state.resetLink}
            </Link>
          </div>
        )}
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
