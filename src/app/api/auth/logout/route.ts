// kill the session cookie and every token issued before it.
import { currentUser, endSession, errorResponse } from "@/lib/auth";

export async function POST() {
  try {
    const me = await currentUser();
    if (me) await endSession(me.id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
