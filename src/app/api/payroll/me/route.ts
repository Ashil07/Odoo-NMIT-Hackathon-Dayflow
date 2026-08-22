// my own salary, computed from my stored wage minus unpaid days.
import { prisma } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/auth";
import { payrollFor } from "@/lib/dayflow";
import { payableDaysFor } from "@/lib/payable-days";

export async function GET() {
  try {
    const me = await requireUser();
    const profile = await prisma.profile.findUnique({ where: { userId: me.id } });
    const wage = profile?.monthlyWage ?? 0;
    const days = await payableDaysFor(me.id);
    return Response.json({ wage, days, payroll: payrollFor(wage, days) });
  } catch (e) {
    return errorResponse(e);
  }
}
