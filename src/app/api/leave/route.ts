// apply for leave (any user) / list every request (hr only).
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireRole, requireUser } from "@/lib/auth";
import { parseBody, leaveApplySchema } from "@/lib/validators";
import { fmtRange } from "@/lib/format";
import { dayspan } from "@/lib/dayflow";
import { daysLeft, ENTITLEMENTS } from "@/lib/leave-balances";
import type { LeaveRow } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const body = await parseBody(leaveApplySchema, req);

    const from = new Date(body.from + "T00:00:00");
    const to = new Date(body.to + "T00:00:00");
    if (to < from) throw new HttpError(400, "End date is before the start date");
    const days = dayspan(body.from, body.to);
    if (days < 1) throw new HttpError(400, "Pick at least one day");

    // balance gate. unpaid skips, everything else capped at entitlement
    const left = await daysLeft(me.id, body.type);
    if (days > left) {
      const cap = ENTITLEMENTS[body.type as keyof typeof ENTITLEMENTS];
      throw new HttpError(400, `Only ${left} of ${cap} ${body.type.toLowerCase()} days left`);
    }

    const created = await prisma.leaveRequest.create({
      data: {
        userId: me.id,
        type: body.type,
        from,
        to,
        days,
        remarks: body.remarks || "No remarks added.",
        attachment: body.type === "Sick" && body.attach ? "certificate.pdf" : null,
      },
    });
    return Response.json({
      ok: true,
      request: {
        id: created.id,
        who: me.name,
        type: created.type + " leave",
        range: fmtRange(from, to),
        days,
        status: "Pending",
        note: created.remarks,
      } satisfies LeaveRow,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// hr sees the whole queue
export async function GET() {
  try {
    await requireRole("HR_ADMIN");
    const rows = await prisma.leaveRequest.findMany({
      include: { user: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    const list: LeaveRow[] = rows.map((r) => ({
      id: r.id,
      who: r.user.name,
      type: r.type + " leave",
      range: fmtRange(r.from, r.to),
      days: r.days,
      status: r.status as LeaveRow["status"],
      note: r.status === "Pending" ? r.remarks || "No remarks added." : r.decisionNote || r.remarks || "—",
      attach: r.attachment ?? undefined,
      decisionNote: r.decisionNote ?? undefined,
    }));
    return Response.json({ requests: list });
  } catch (e) {
    return errorResponse(e);
  }
}
