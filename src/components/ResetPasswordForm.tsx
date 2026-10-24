"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/actions/password-reset";

const initialState: ResetPasswordState = {};

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-success">
        Password updated.{" "}
        <Link href="/login" className="font-medium underline">
          Sign in now
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" required minLength={8} placeholder="New password" className="input" />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        Update password
      </button>
    </form>
  );
}
