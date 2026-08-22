// approve or reject. hr only, pending requests only, comment optional.
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireRole } from "@/lib/auth";
import { parseBody, leaveDecideSchema } from "@/lib/validators";
import { balanceMessage, daysLeft } from "@/lib/leave-balances";
import { originOf, publish } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("HR_ADMIN");
    const { id } = await params;
    const body = await parseBody(leaveDecideSchema, req);

    const row = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, "Request not found");
    if (row.status !== "Pending") throw new HttpError(409, "Request already decided");

    // recheck at the gate: other approvals may have burned the balance since apply
    if (body.status === "Approved") {
      const left = await daysLeft(row.userId, row.type);
      if (row.days > left) {
        throw new HttpError(400, `Cannot approve — ${balanceMessage(row.type, left, row.days)}`);
      }
    }

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: body.status,
        decidedById: me.id,
        decisionNote: body.comment ? `“${body.comment}” — ${me.name}` : `Decided by ${me.name}`,
      },
    });
    // the employee hears the verdict, hr hears the queue shrink
    const origin = originOf(req);
    publish("leave", { userId: row.userId, origin });
    // an approved unpaid stretch moves their payable days
    if (body.status === "Approved" && row.type === "Unpaid") publish("payroll", { userId: row.userId, origin });

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
