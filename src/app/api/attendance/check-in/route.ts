// punch in. second punch bounces.
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireUser } from "@/lib/auth";
import { dayStart } from "@/lib/format";
import { originOf, publish } from "@/lib/realtime";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const today = dayStart();

    const existing = await prisma.attendance.findUnique({
      where: { userId_day: { userId: me.id, day: today } },
    });
    if (existing?.inAt) throw new HttpError(409, "Already checked in today");

    await prisma.attendance.upsert({
      where: { userId_day: { userId: me.id, day: today } },
      create: { userId: me.id, day: today, inAt: new Date(), status: "Present" },
      update: { inAt: new Date(), status: "Present" },
    });
    publish("attendance", { userId: me.id, origin: originOf(req) });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
