// email + password in, session cookie out. wrong creds and unverified get distinct errors.
import { prisma } from "@/lib/db";
import { checkPassword, errorResponse, HttpError, issueSession } from "@/lib/auth";
import { parseBody, loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await parseBody(loginSchema, req);
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user || !(await checkPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }
    if (!user.emailVerified) {
      throw new HttpError(403, "Verify your email before signing in");
    }

    await issueSession(user.id, user.role);
    return Response.json({ ok: true, role: user.role, name: user.name });
  } catch (e) {
    return errorResponse(e);
  }
}
