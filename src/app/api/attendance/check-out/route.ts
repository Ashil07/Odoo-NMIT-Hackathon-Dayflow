// punch out. under four hours counts as a half-day.
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireUser } from "@/lib/auth";
import { dayStart, hhmm, hrsBetween } from "@/lib/format";
import { originOf, publish } from "@/lib/realtime";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const today = dayStart();

    const row = await prisma.attendance.findUnique({
      where: { userId_day: { userId: me.id, day: today } },
    });
    if (!row?.inAt) throw new HttpError(409, "Check in first");
    if (row.outAt) throw new HttpError(409, "Already checked out today");

    const now = new Date();
    const hrs = (now.getTime() - row.inAt.getTime()) / 3_600_000;
    await prisma.attendance.update({
      where: { id: row.id },
      data: { outAt: now, status: hrs < 4 ? "Half-day" : "Present" },
    });
    publish("attendance", { userId: me.id, origin: originOf(req) });
    return Response.json({ ok: true, outAt: hhmm(now), hrs: hrsBetween(row.inAt, now) });
  } catch (e) {
    return errorResponse(e);
  }
}
