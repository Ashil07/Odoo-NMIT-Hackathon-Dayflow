// kill the session cookie.
import { endSession, errorResponse } from "@/lib/auth";

export async function POST() {
  try {
    await endSession();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
