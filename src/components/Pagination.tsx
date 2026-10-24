import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else if (value) params.set(key, value);
    }
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`btn btn-secondary ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={hrefFor(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              p === page ? "bg-brand text-white" : "text-foreground hover:bg-surface-muted"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`btn btn-secondary ${page === totalPages ? "pointer-events-none opacity-40" : ""}`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
