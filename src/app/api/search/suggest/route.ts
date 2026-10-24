import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", title: { contains: q } },
    select: { title: true, slug: true },
    take: 6,
    orderBy: { views: "desc" },
  });

  return NextResponse.json({ suggestions: listings });
}
