import { requireUser } from "@/lib/auth-helpers";
import { getSellerStats } from "@/lib/seller";
import { formatMoney } from "@/lib/money";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const stats = await getSellerStats(user.id);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Active listings" value={String(stats.activeListings)} />
        <StatCard label="Paused listings" value={String(stats.pausedListings)} />
        <StatCard label="Completed sales" value={String(stats.completedSales)} />
        <StatCard label="Gross sales" value={formatMoney(stats.grossRevenue)} />
        <StatCard label="Net payout" value={formatMoney(stats.totalRevenue)} />
      </div>
      <div className="card p-5 text-sm text-muted">
        Manage your listings, review buyer questions, and track orders from the menu on the left. HavenMarket takes a
        10% seller fee ({formatMoney(stats.platformFee)} so far); net payout reflects simulated payments collected
        through this demo&apos;s checkout flow after that fee.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
