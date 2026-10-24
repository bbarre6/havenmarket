import { NextRequest, NextResponse } from "next/server";
import { finalizeExpiredAuctions, promoteUpcomingAuctions } from "@/lib/auctions";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await promoteUpcomingAuctions();
  await finalizeExpiredAuctions();

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
