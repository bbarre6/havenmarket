"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrderAction, type CheckoutFormState } from "@/actions/orders";
import AddressForm from "@/components/AddressForm";
import { formatMoney } from "@/lib/money";
import { CreditCard, Plus } from "lucide-react";

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

export default function CheckoutForm({
  addresses,
  totals,
  stripeEnabled,
}: {
  addresses: AddressOption[];
  totals: { subtotal: number; shippingTotal: number; taxTotal: number; total: number };
  stripeEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  const [selected, setSelected] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const router = useRouter();

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
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
                  <span className="block font-medium text-foreground">
                    {a.fullName} {a.isDefault && <span className="badge badge-blue ml-1">Default</span>}
                  </span>
                  <span className="block text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {!showNewAddress && (
            <button
              type="button"
              onClick={() => setShowNewAddress(true)}
              className="btn btn-secondary mt-3"
            >
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

        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
            <CreditCard size={16} /> Payment
          </h2>
          <p className="text-sm text-muted">
            {stripeEnabled ? (
              <>
                You&apos;ll be redirected to Stripe to pay by card. This store is running in{" "}
                <strong>Stripe test mode</strong> — use card number 4242 4242 4242 4242, any future expiry, and any
                CVC. No real money moves.
              </>
            ) : (
              <>
                This demo runs in <strong>simulated payment mode</strong> — no real card is charged. Set
                STRIPE_SECRET_KEY to enable real Stripe test-mode checkout.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="mb-4 text-base font-bold text-foreground">Order total</h2>
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
          <Row label="Shipping" value={formatMoney(totals.shippingTotal)} />
          <Row label="Estimated tax" value={formatMoney(totals.taxTotal)} />
          <div className="my-2 border-t border-border" />
          <Row label="Total" value={formatMoney(totals.total)} bold />
        </div>
        {state.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}
        <button type="submit" disabled={pending || !selected} className="btn btn-primary mt-4 w-full">
          {pending
            ? stripeEnabled
              ? "Redirecting to payment..."
              : "Placing order..."
            : stripeEnabled
              ? `Continue to payment — ${formatMoney(totals.total)}`
              : `Place order — ${formatMoney(totals.total)}`}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
