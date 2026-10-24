"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAddressAction } from "@/actions/addresses";

export default function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!confirm("Delete this address?")) return;
          await deleteAddressAction(addressId);
          router.refresh();
        })
      }
      className="flex items-center gap-1 text-xs text-muted hover:text-danger"
    >
      <Trash2 size={13} /> Delete
    </button>
  );
}
