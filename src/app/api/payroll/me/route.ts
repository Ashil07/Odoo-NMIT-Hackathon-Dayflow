// my own salary, computed from my stored wage.
import { prisma } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/auth";
import { payrollFor } from "@/lib/dayflow";

export async function GET() {
  try {
    const me = await requireUser();
    const profile = await prisma.profile.findUnique({ where: { userId: me.id } });
    const wage = profile?.monthlyWage ?? 0;
    return Response.json({ wage, payroll: payrollFor(wage) });
  } catch (e) {
    return errorResponse(e);
  }
}
