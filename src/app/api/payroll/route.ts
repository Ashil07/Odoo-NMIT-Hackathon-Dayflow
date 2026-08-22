// wage book for hr. one row per employee.
import { prisma } from "@/lib/db";
import { errorResponse, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("HR_ADMIN");
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: { profile: true },
      orderBy: { name: "asc" },
    });
    const list = users.map((u) => ({
      id: u.id,
      empId: u.empId,
      name: u.name,
      title: u.profile?.title ?? "—",
      dept: u.profile?.dept ?? "—",
      wage: u.profile?.monthlyWage ?? 0,
    }));
    return Response.json({ list });
  } catch (e) {
    return errorResponse(e);
  }
}
