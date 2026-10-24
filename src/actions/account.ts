"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireFullUser } from "@/lib/auth-helpers";

export type AccountFormState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireFullUser();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const storeName = String(formData.get("storeName") ?? "").trim();

  if (name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, bio: bio || null, storeName: storeName || null },
  });

  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireFullUser();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
