"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Truck, PackageCheck } from "lucide-react";
import { advanceOrderStatusAction } from "@/actions/orders";

const LABEL: Record<string, { label: string; icon: typeof Truck }> = {
  PAID: { label: "Mark as shipped", icon: Truck },
  SHIPPED: { label: "Mark as delivered", icon: PackageCheck },
};

export default function AdvanceOrderButton({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const config = LABEL[status];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await advanceOrderStatusAction(orderId);
            router.refresh();
          } catch (err) {
            alert(err instanceof Error ? err.message : "Could not update order.");
          }
        })
      }
      className="btn btn-secondary text-xs"
    >
      <Icon size={13} /> {config.label}
    </button>
  );
}
