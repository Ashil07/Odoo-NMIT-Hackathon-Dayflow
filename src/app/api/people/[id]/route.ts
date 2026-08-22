// hr manages one employee's record.
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, requireRole } from "@/lib/auth";
import { parseBody, employeePatchSchema } from "@/lib/validators";
import { originOf, publish } from "@/lib/realtime";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("HR_ADMIN");
    const { id } = await params;
    const body = await parseBody(employeePatchSchema, req);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "Employee not found");

    const { name, ...profileFields } = body;
    await prisma.$transaction([
      ...(name ? [prisma.user.update({ where: { id }, data: { name } })] : []),
      prisma.profile.update({
        where: { userId: id },
        data: Object.fromEntries(Object.entries(profileFields).filter(([, v]) => v !== undefined)),
      }),
    ]);
    publish("profile", { userId: id, origin: originOf(req) });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
