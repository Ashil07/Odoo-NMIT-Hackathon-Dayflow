// whole-company register + directory in one payload. hr only.
import { prisma } from "@/lib/db";
import { errorResponse, requireRole } from "@/lib/auth";
import { dayStart, hhmm, hrsBetween } from "@/lib/format";
import type { Person } from "@/lib/types";

export async function GET(req: Request) {
  try {
    await requireRole("HR_ADMIN");

    // optional day override, else today
    const dayParam = new URL(req.url).searchParams.get("day");
    const parsed = dayParam ? new Date(dayParam + "T00:00:00") : null;
    const today = parsed && !Number.isNaN(parsed.getTime()) ? parsed : dayStart();
    const [users, rows, leaves] = await Promise.all([
      prisma.user.findMany({ include: { profile: true }, orderBy: { name: "asc" } }),
      prisma.attendance.findMany({ where: { day: today } }),
      prisma.leaveRequest.findMany({ where: { status: "Approved" } }),
    ]);

    const attByUser = new Map(rows.map((r) => [r.userId, r]));
    const onLeave = new Set(
      leaves.filter((l) => l.from <= today && l.to >= today).map((l) => l.userId),
    );

    const people: Person[] = users.map((u) => {
      const a = attByUser.get(u.id);
      const hrs = a?.inAt && a?.outAt ? hrsBetween(a.inAt, a.outAt) : "—";
      const hNum = Number(hrs);
      const st = a
        ? a.status
        : onLeave.has(u.id)
          ? "Leave"
          : "Absent";
      return {
        id: u.id,
        empId: u.empId,
        name: u.name,
        role: u.profile?.title ?? "—",
        dept: u.profile?.dept ?? "—",
        st,
        in: a?.inAt ? hhmm(a.inAt) : "—",
        out: a?.outAt ? hhmm(a.outAt) : "—",
        hrs,
        extra: Number.isFinite(hNum) && hNum > 8.5 ? "+" + (hNum - 8.5).toFixed(1) : "—",
        mgr: u.profile?.manager ?? "—",
        joined: u.profile?.joined ?? "—",
        loc: u.profile?.location ?? "—",
        wage: u.profile?.monthlyWage ?? 0,
      };
    });
    return Response.json({ people, today: today.toISOString() });
  } catch (e) {
    return errorResponse(e);
  }
}
