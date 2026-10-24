const KEY = "havenmarket:recently-viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((s) => s !== slug);
    const next = [slug, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, etc.) — safe to ignore
  }
}
