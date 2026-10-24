import { prisma } from "@/lib/prisma";

export async function getReports(status?: "OPEN" | "REVIEWED" | "DISMISSED" | "ACTIONED") {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    include: {
      listing: {
        select: { id: true, title: true, slug: true, status: true, seller: { select: { id: true, name: true, email: true } } },
      },
      reporter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReportCounts() {
  const counts = await prisma.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const byStatus: Record<string, number> = { OPEN: 0, REVIEWED: 0, DISMISSED: 0, ACTIONED: 0 };
  for (const row of counts) {
    byStatus[row.status] = row._count._all;
  }
  return byStatus;
}
