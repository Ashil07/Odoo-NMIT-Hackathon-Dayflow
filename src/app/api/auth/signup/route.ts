// create account. dup email or emp id bounces.
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { errorResponse, HttpError, hashPassword } from "@/lib/auth";
import { parseBody, signupSchema } from "@/lib/validators";

// pretty name from an email prefix, "aarav.rao" -> "Aarav Rao"
function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ") || "New Member";
}

export async function POST(req: Request) {
  try {
    const body = await parseBody(signupSchema, req);
    const empId = body.empId.toUpperCase();

    const dup = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { empId }] },
      select: { email: true, empId: true },
    });
    if (dup) {
      throw new HttpError(
        409,
        dup.email === body.email ? "That email is already registered" : "That Employee ID is already registered",
      );
    }

    const verifyToken = randomBytes(24).toString("hex");
    const name = body.name ?? nameFromEmail(body.email);
    await prisma.user.create({
      data: {
        empId,
        email: body.email,
        name,
        passwordHash: await hashPassword(body.password),
        role: body.role === "hr_admin" ? "HR_ADMIN" : "EMPLOYEE",
        verifyToken,
        profile: { create: {} },
      },
    });

    // no mailer in the hackathon build: the ui shows this link to click
    return Response.json({
      ok: true,
      name,
      verifyUrl: `/api/auth/verify?token=${verifyToken}`,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
