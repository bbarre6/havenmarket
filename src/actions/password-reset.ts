"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createResetToken, verifyResetToken } from "@/lib/reset-token";

export type RequestResetState = { resetLink?: string; info?: string };

export async function requestPasswordResetAction(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists, to avoid leaking which emails are registered.
  if (!user) {
    return { info: "If an account exists for that email, a reset link has been generated below." };
  }

  const token = createResetToken(email);
  return { resetLink: `/reset-password?token=${token}` };
}

export type ResetPasswordState = { error?: string; success?: boolean };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const verified = verifyResetToken(token);
  if (!verified) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { email: verified.email }, data: { passwordHash } });

  return { success: true };
}
