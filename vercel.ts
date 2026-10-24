import type { VercelConfig } from "@vercel/config/v1";

// Auctions already close correctly the moment anyone views them
// (src/lib/auctions.ts, finalizeIfExpired) — this cron is just the safety
// net for auctions nobody happens to look at again after they end.
// Hobby plan crons only guarantee one run per day, hence the daily schedule.
export const config: VercelConfig = {
  crons: [{ path: "/api/cron/finalize-auctions", schedule: "17 4 * * *" }],
};
