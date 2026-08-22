// first-login (or voluntary) password rotation. clears the flag and reissues
// the session so the old token dies with the temp password.
import { prisma } from "@/lib/db";
import { checkPassword, currentUser, errorResponse, hashPassword, HttpError, issueSession } from "@/lib/auth";
import { changePasswordSchema, parseBody } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const me = await currentUser();
    if (!me) throw new HttpError(401, "Sign in required");

    const body = await parseBody(changePasswordSchema, req);
    const user = await prisma.user.findUnique({ where: { id: me.id } });
    if (!user) throw new HttpError(401, "Sign in required");

    if (!(await checkPassword(body.currentPassword, user.passwordHash))) {
      throw new HttpError(401, "Current password is wrong");
    }
    if (await checkPassword(body.newPassword, user.passwordHash)) {
      throw new HttpError(400, "New password must differ from the current one");
    }

    await prisma.user.update({
      where: { id: me.id },
      data: {
        passwordHash: await hashPassword(body.newPassword),
        mustChangePassword: false,
        tokenVersion: { increment: 1 },
      },
    });
    await issueSession(me.id, user.role, false);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
