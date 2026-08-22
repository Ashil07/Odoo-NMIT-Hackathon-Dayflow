// hr edits one employee's wage. whole structure derives from it.
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireRole } from "@/lib/auth";
import { parseBody, wagePatchSchema } from "@/lib/validators";
import { payrollFor } from "@/lib/dayflow";
import { originOf, publish } from "@/lib/realtime";

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole("HR_ADMIN");
    const { userId } = await params;
    const body = await parseBody(wagePatchSchema, req);

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new HttpError(404, "Employee not found");

    const updated = await prisma.profile.update({
      where: { userId },
      data: { monthlyWage: body.monthlyWage },
    });
    publish("payroll", { userId, origin: originOf(req) });
    return Response.json({ ok: true, wage: updated.monthlyWage, payroll: payrollFor(updated.monthlyWage) });
  } catch (e) {
    return errorResponse(e);
  }
}
