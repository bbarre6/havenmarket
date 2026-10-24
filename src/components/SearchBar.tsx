"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Suggestion = { title: string; slug: string };

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const query = value.trim();
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setSuggestions(data.suggestions ?? []))
        .catch(() => {});
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  function runSearch(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("page");
    setOpen(false);
    router.push(`/search?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(value);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search for anything"
          aria-label="Search for products"
          autoComplete="off"
          className="w-full rounded-l-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="flex items-center justify-center rounded-r-lg bg-brand px-4 text-white transition hover:bg-brand-dark"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {suggestions.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => router.push(`/product/${s.slug}`)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
              >
                <Search size={13} className="text-muted" /> {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
