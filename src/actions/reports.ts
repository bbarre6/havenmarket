"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { reportSchema } from "@/lib/validation";

export type SimpleFormState = { error?: string; success?: boolean };

export async function reportListingAction(
  _prevState: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const user = await requireUser();
  const parsed = reportSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report." };
  }

  await prisma.report.create({
    data: {
      listingId: parsed.data.listingId,
      reporterId: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });

  return { success: true };
}
