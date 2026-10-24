import Link from "next/link";
import { getSiteStats } from "@/lib/admin";
import { formatMoney } from "@/lib/money";

export default async function AdminStatsPage() {
  const stats = await getSiteStats();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-foreground">Site stats</h2>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">Users</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard label="Sellers" value={stats.totalSellers} />
          <StatCard label="New (7 days)" value={stats.newUsers7d} />
          <StatCard
            label="Open reports"
            value={stats.openReports}
            href={stats.openReports > 0 ? "/admin/reports" : undefined}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">Listings</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total listings" value={stats.totalListings} />
          <StatCard label="Active" value={stats.listingCounts.ACTIVE} />
          <StatCard label="Sold" value={stats.listingCounts.SOLD} />
          <StatCard label="Paused" value={stats.listingCounts.PAUSED} />
          <StatCard label="Ended" value={stats.listingCounts.ENDED} />
          <StatCard label="Draft" value={stats.listingCounts.DRAFT} />
          <StatCard label="Removed" value={stats.listingCounts.DELETED} />
          <StatCard label="Categories" value={stats.totalCategories} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">Sales</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total orders" value={stats.totalOrders} />
          <StatCard label="Completed orders" value={stats.completedOrderCount} />
          <StatCard label="Gross merchandise value" value={formatMoney(stats.gmv)} />
          <StatCard label="Money made (10% fee)" value={formatMoney(stats.platformRevenue)} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">Auctions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total auctions" value={stats.totalAuctions} />
          <StatCard label="Live now" value={stats.liveAuctions} />
          <StatCard label="Total bids" value={stats.totalBids} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="card p-4">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="block transition hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}
