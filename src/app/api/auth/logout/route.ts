// kill the session cookie and every token issued before it.
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { currentUser, errorResponse, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  try {
    // bump version only if the token still maps to a user; the cookie dies
    // either way so a stale token can never loop the proxy again
    const me = await currentUser();
    if (me) {
      await prisma.user.update({
        where: { id: me.id },
        data: { tokenVersion: { increment: 1 } },
      });
    }
    (await cookies()).delete(SESSION_COOKIE);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
