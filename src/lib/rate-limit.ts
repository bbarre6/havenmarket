import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazily constructed: reading process.env at module load time (instead of
// inside this function) crashes `next build` whenever env vars aren't
// populated yet at build time, and can silently bind to an empty URL/token
// depending on import order.
let limiters: {
  login: Ratelimit;
  signup: Ratelimit;
  message: Ratelimit;
  bid: Ratelimit;
} | null = null;

function getLimiters() {
  if (limiters) return limiters;

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  limiters = {
    // Brute-force login protection: keyed by the attempted email, not the
    // caller's IP, since a credential-stuffing bot rotates IPs but keeps
    // hammering the same account.
    login: new Ratelimit({
      redis,
      prefix: "ratelimit:login",
      limiter: Ratelimit.slidingWindow(5, "1 m"),
    }),
    // Signup is keyed by IP: this is the actual bot-signup vector — scripted
    // account creation from one source hitting the form repeatedly.
    signup: new Ratelimit({
      redis,
      prefix: "ratelimit:signup",
      limiter: Ratelimit.slidingWindow(5, "10 m"),
    }),
    message: new Ratelimit({
      redis,
      prefix: "ratelimit:message",
      limiter: Ratelimit.slidingWindow(20, "1 m"),
    }),
    // Generous enough to not get in the way of real sniping near auction close.
    bid: new Ratelimit({
      redis,
      prefix: "ratelimit:bid",
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    }),
  };
  return limiters;
}

const TOO_MANY_REQUESTS = "Too many attempts. Please wait a moment and try again.";

export async function checkLoginRateLimit(email: string): Promise<string | null> {
  const { success } = await getLimiters().login.limit(email.toLowerCase());
  return success ? null : TOO_MANY_REQUESTS;
}

export async function checkSignupRateLimit(ip: string): Promise<string | null> {
  const { success } = await getLimiters().signup.limit(ip);
  return success ? null : TOO_MANY_REQUESTS;
}

export async function checkMessageRateLimit(userId: string): Promise<string | null> {
  const { success } = await getLimiters().message.limit(userId);
  return success ? null : TOO_MANY_REQUESTS;
}

export async function checkBidRateLimit(userId: string): Promise<string | null> {
  const { success } = await getLimiters().bid.limit(userId);
  return success ? null : TOO_MANY_REQUESTS;
}
