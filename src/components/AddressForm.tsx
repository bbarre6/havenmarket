"use client";

import { useActionState, useEffect } from "react";
import { createAddressAction, type AddressFormState } from "@/actions/addresses";

const initialState: AddressFormState = {};

export default function AddressForm({ onDone }: { onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(createAddressAction, initialState);

  useEffect(() => {
    if (state.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="card flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold text-foreground">New shipping address</h3>
      <input name="fullName" required placeholder="Full name" className="input" />
      <input name="line1" required placeholder="Address line 1" className="input" />
      <input name="line2" placeholder="Address line 2 (optional)" className="input" />
      <div className="grid grid-cols-3 gap-2">
        <input name="city" required placeholder="City" className="input" />
        <input name="state" required placeholder="State" className="input" />
        <input name="postalCode" required placeholder="ZIP" className="input" />
      </div>
      <input name="phone" placeholder="Phone (optional)" className="input" />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="isDefault" className="accent-[var(--brand)]" />
        Set as default address
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        Save address
      </button>
    </form>
  );
}
