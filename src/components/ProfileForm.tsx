"use client";

import { useActionState } from "react";
import { updateProfileAction, type AccountFormState } from "@/actions/account";

const initialState: AccountFormState = {};

export default function ProfileForm({
  name,
  bio,
  storeName,
  isSeller,
}: {
  name: string;
  bio: string;
  storeName: string;
  isSeller: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-5">
      <h2 className="text-base font-bold text-foreground">Profile</h2>
      <div>
        <label className="label">Full name</label>
        <input name="name" defaultValue={name} required minLength={2} className="input" />
      </div>
      {isSeller && (
        <div>
          <label className="label">Store name</label>
          <input name="storeName" defaultValue={storeName} placeholder="Your shop's display name" className="input" />
        </div>
      )}
      <div>
        <label className="label">Bio</label>
        <textarea name="bio" defaultValue={bio} rows={3} placeholder="Tell buyers a bit about yourself" className="input" />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Profile updated.</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        Save profile
      </button>
    </form>
  );
}
