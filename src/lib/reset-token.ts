import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "dev-secret";
const TTL_MS = 1000 * 60 * 30; // 30 minutes

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createResetToken(email: string) {
  const expires = Date.now() + TTL_MS;
  const payload = `${email}.${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyResetToken(token: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [email, expiresStr, sig] = decoded.split(".");
    if (!email || !expiresStr || !sig) return null;
    const payload = `${email}.${expiresStr}`;
    if (sign(payload) !== sig) return null;
    if (Date.now() > Number(expiresStr)) return null;
    return { email };
  } catch {
    return null;
  }
}
