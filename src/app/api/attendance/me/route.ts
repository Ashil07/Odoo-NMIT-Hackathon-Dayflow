// my own daily log, newest first.
import { prisma } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/auth";
import { fmtDay, hhmm, hrsBetween } from "@/lib/format";
import type { LogRow } from "@/lib/types";

export async function GET() {
  try {
    const me = await requireUser();
    const rows = await prisma.attendance.findMany({
      where: { userId: me.id },
      orderBy: { day: "desc" },
      take: 30,
    });
    const log: LogRow[] = rows.map((r) => ({
      day: fmtDay(r.day),
      in: r.inAt ? hhmm(r.inAt) : "—",
      out: r.outAt ? hhmm(r.outAt) : "—",
      hrs: r.inAt && r.outAt ? hrsBetween(r.inAt, r.outAt) : "—",
      status: r.status,
    }));
    return Response.json({ log });
  } catch (e) {
    return errorResponse(e);
  }
}
