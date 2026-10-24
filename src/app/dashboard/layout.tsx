import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, List, Package, MessageSquareText, PlusCircle } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "Listings", icon: List },
  { href: "/dashboard/orders", label: "Sales & orders", icon: Package },
  { href: "/dashboard/questions", label: "Buyer questions", icon: MessageSquareText },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="container-page grid grid-cols-1 gap-6 py-8 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-1">
        <h1 className="mb-2 px-2 text-lg font-bold text-foreground">Seller dashboard</h1>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <item.icon size={16} /> {item.label}
          </Link>
        ))}
        <Link href="/sell" className="btn btn-primary mt-3">
          <PlusCircle size={15} /> New listing
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
