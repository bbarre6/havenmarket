"use client";

import { useActionState } from "react";
import { changePasswordAction, type AccountFormState } from "@/actions/account";

const initialState: AccountFormState = {};

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-5">
      <h2 className="text-base font-bold text-foreground">Change password</h2>
      <div>
        <label className="label">Current password</label>
        <input name="currentPassword" type="password" required className="input" autoComplete="current-password" />
      </div>
      <div>
        <label className="label">New password</label>
        <input name="newPassword" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Password updated.</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        Update password
      </button>
    </form>
  );
}
