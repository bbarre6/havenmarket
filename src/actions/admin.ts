"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function updateReportStatusAction(
  reportId: string,
  status: "REVIEWED" | "DISMISSED" | "ACTIONED"
) {
  await requireAdmin();
  await prisma.report.update({ where: { id: reportId }, data: { status } });
  revalidatePath("/admin/reports");
}

export async function removeReportedListingAction(reportId: string, listingId: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.listing.update({ where: { id: listingId }, data: { status: "DELETED" } }),
    prisma.report.update({ where: { id: reportId }, data: { status: "ACTIONED" } }),
  ]);
  revalidatePath("/admin/reports");
}
