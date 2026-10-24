// Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically to the project's
// current production domain (custom domain if one is attached, otherwise the
// *.vercel.app alias) — prefer that over hardcoding a URL so this keeps
// working when a custom domain gets attached later.
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.NEXTAUTH_URL ?? "http://localhost:3000");

export const SITE_NAME = "Buy Stuff";
