"use client";

import { useActionState } from "react";
import { registerAction, type RegisterFormState } from "@/actions/auth";

const initialState: RegisterFormState = {};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="label">Full name</label>
        <input name="name" required minLength={2} className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label">Password</label>
        <input name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
