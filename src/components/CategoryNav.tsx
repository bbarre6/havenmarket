import Link from "next/link";
import { CATEGORY_TREE } from "@/lib/categories-data";
import { Menu } from "lucide-react";

export default function CategoryNav() {
  return (
    <div className="hidden border-t border-border bg-surface-muted md:block">
      <div className="container-page flex h-11 items-center gap-1 overflow-x-auto">
        <div className="group relative">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface">
            <Menu size={15} /> All categories
          </button>
          <div className="invisible absolute left-0 top-full z-50 grid w-[560px] grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
            {CATEGORY_TREE.map((cat) => (
              <div key={cat.slug}>
                <Link href={`/search?category=${cat.slug}`} className="text-sm font-semibold text-foreground hover:text-brand">
                  {cat.name}
                </Link>
                <ul className="mt-1.5 space-y-1">
                  {cat.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/search?category=${cat.slug}&sub=${child.slug}`}
                        className="text-sm text-muted hover:text-brand"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {CATEGORY_TREE.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search?category=${cat.slug}`}
            className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface"
          >
            {cat.name}
          </Link>
        ))}
        <Link
          href="/sell"
          className="ml-auto shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-brand hover:bg-surface"
        >
          Start selling
        </Link>
      </div>
    </div>
  );
}
