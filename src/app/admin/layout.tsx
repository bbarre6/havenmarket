import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Flag } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";

const NAV = [{ href: "/admin/reports", label: "Reports", icon: Flag }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin/reports");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="container-page grid grid-cols-1 gap-6 py-8 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-1">
        <h1 className="mb-2 flex items-center gap-2 px-2 text-lg font-bold text-foreground">
          <ShieldAlert size={18} /> Admin
        </h1>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <item.icon size={16} /> {item.label}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
