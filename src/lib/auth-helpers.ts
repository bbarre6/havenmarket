import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireFullUser() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// For Server Components (pages), where throwing produces a raw crash page
// instead of sending a logged-out visitor to /login. Server Actions should
// keep using requireUser()/requireFullUser() — throwing there is correct,
// it surfaces as a form error instead of a redirect mid-mutation.
export async function requireUserForPage(callbackUrl: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function requireFullUserForPage(callbackUrl: string) {
  const sessionUser = await requireUserForPage(callbackUrl);
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}
