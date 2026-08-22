// my leave requests, newest first.
import { prisma } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";
import type { LeaveRow } from "@/lib/types";

export async function GET() {
  try {
    const me = await requireUser();
    const rows = await prisma.leaveRequest.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    });
    const list: LeaveRow[] = rows.map((r) => ({
      id: r.id,
      who: me.name,
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
