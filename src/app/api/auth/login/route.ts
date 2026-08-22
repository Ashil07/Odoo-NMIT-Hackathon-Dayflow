// login id (emp id) or email + password in, session cookie out.
// temp-password users get flagged: frontend steers them to change password.
import { prisma } from "@/lib/db";
import { checkPassword, errorResponse, HttpError, issueSession } from "@/lib/auth";
import { parseBody, loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await parseBody(loginSchema, req);
    const identifier = body.identifier;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { empId: identifier.toUpperCase() }],
      },
    });

    if (!user || !(await checkPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid login ID or password");
    }
    if (!user.emailVerified) {
      throw new HttpError(403, "Verify your email before signing in");
    }

    await issueSession(user.id, user.role, user.mustChangePassword);
    return Response.json({
      ok: true,
      role: user.role,
      name: user.name,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
