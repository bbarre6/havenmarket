export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function uniqueSlug(title: string): string {
  const base = slugify(title);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
