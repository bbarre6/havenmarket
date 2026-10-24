"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Package, Settings, Store, Heart, MessageCircle, ShieldAlert } from "lucide-react";

type Props = {
  user: { name?: string | null; email?: string | null; isSeller: boolean; isAdmin?: boolean } | null;
};

export default function AccountMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="btn btn-secondary">
          Sign in
        </Link>
        <Link href="/signup" className="btn btn-primary">
          Sign up
        </Link>
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] ?? "Account";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground hover:bg-surface-muted"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand">
          {firstName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:inline">Hi, {firstName}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
            <Settings size={15} /> Account settings
          </Link>
          <Link href="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
            <Package size={15} /> Orders
          </Link>
          <Link href="/account/watchlist" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
            <Heart size={15} /> Watchlist
          </Link>
          <Link href="/messages" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
            <MessageCircle size={15} /> Messages
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
            <Store size={15} /> Seller dashboard
          </Link>
          {user.isAdmin && (
            <Link href="/admin/reports" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted" onClick={() => setOpen(false)}>
              <ShieldAlert size={15} /> Admin
            </Link>
          )}
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-bg"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
