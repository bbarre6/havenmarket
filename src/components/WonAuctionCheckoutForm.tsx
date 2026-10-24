"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { payForWonAuctionAction, type CheckoutFormState } from "@/actions/orders";
import AddressForm from "@/components/AddressForm";
import { formatMoney } from "@/lib/money";
import { Plus } from "lucide-react";

type AddressOption = {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

const initialState: CheckoutFormState = {};

export default function WonAuctionCheckoutForm({
  auctionId,
  addresses,
  total,
  stripeEnabled,
}: {
  auctionId: string;
  addresses: AddressOption[];
  total: number;
  stripeEnabled: boolean;
}) {
  const action = payForWonAuctionAction.bind(null, auctionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selected, setSelected] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const router = useRouter();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="card p-5">
        <h2 className="mb-3 text-base font-bold text-foreground">Shipping address</h2>
        <div className="flex flex-col gap-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                selected === a.id ? "border-brand bg-brand-50" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="addressId"
                value={a.id}
                checked={selected === a.id}
                onChange={() => setSelected(a.id)}
                className="mt-0.5 accent-[var(--brand)]"
              />
              <span>
                <span className="block font-medium text-foreground">{a.fullName}</span>
                <span className="block text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                </span>
              </span>
            </label>
          ))}
        </div>
        {!showNewAddress && (
          <button type="button" onClick={() => setShowNewAddress(true)} className="btn btn-secondary mt-3">
            <Plus size={14} /> Add new address
          </button>
        )}
      </div>

      {showNewAddress && (
        <AddressForm
          onDone={() => {
            setShowNewAddress(false);
            router.refresh();
          }}
        />
      )}

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending || !selected} className="btn btn-primary self-start">
        {pending
          ? stripeEnabled
            ? "Redirecting to payment..."
            : "Processing..."
          : stripeEnabled
            ? `Continue to payment — ${formatMoney(total)}`
            : `Pay now — ${formatMoney(total)}`}
      </button>
    </form>
  );
}
