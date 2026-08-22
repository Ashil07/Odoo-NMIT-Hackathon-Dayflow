// my profile. read freely, edit only phone + address.
import { prisma } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/auth";
import { parseBody, profilePatchSchema } from "@/lib/validators";

export async function GET() {
  try {
    const me = await requireUser();
    const profile = await prisma.profile.findUnique({ where: { userId: me.id } });
    return Response.json({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}

// employees may touch exactly two fields. everything else is hr maintained.
export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    const body = await parseBody(profilePatchSchema, req);

    const updated = await prisma.profile.update({
      where: { userId: me.id },
      data: Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)),
    });
    return Response.json({ ok: true, profile: updated });
  } catch (e) {
    return errorResponse(e);
  }
}
