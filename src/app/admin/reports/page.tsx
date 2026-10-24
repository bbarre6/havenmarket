import Link from "next/link";
import { getReports, getReportCounts } from "@/lib/admin";
import ReportActions from "@/components/ReportActions";

const STATUS_FILTERS = ["OPEN", "REVIEWED", "DISMISSED", "ACTIONED"] as const;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = STATUS_FILTERS.includes(params.status as (typeof STATUS_FILTERS)[number])
    ? (params.status as (typeof STATUS_FILTERS)[number])
    : "OPEN";

  const [reports, counts] = await Promise.all([getReports(status), getReportCounts()]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Listing reports</h2>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={`badge ${s === status ? "badge-blue" : "badge-gray"}`}
          >
            {s} ({counts[s] ?? 0})
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No {status.toLowerCase()} reports.</div>
      ) : (
        <div className="card divide-y divide-border">
          {reports.map((report) => (
            <div key={report.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${report.listing.slug}`}
                  className="block truncate text-sm font-medium text-foreground hover:text-brand"
                >
                  {report.listing.title}
                </Link>
                <p className="text-xs text-muted">
                  Seller: {report.listing.seller.name} ({report.listing.seller.email}) · Listing status:{" "}
                  {report.listing.status}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-semibold">{report.reason}</span>
                  {report.details ? ` — ${report.details}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Reported by {report.reporter.name} ({report.reporter.email}) on{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ReportActions
                reportId={report.id}
                listingId={report.listing.id}
                status={report.status}
                listingDeleted={report.listing.status === "DELETED"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
