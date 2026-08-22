// company sign-up: org + first hr admin in one transaction, then auto-login.
// no employee id, no temp password — the admin picks their own.
import { prisma } from "@/lib/db";
import { errorResponse, hashPassword, HttpError, issueSession } from "@/lib/auth";
import { companySignupSchema, parseBody } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await parseBody(companySignupSchema, req);

    const dupCompany = await prisma.company.findFirst({
      where: { name: { equals: body.companyName, mode: "insensitive" } },
      select: { name: true },
    });
    if (dupCompany) throw new HttpError(409, "A company with that name already exists");

    const dupEmail = await prisma.user.findUnique({ where: { email: body.email }, select: { email: true } });
    if (dupEmail) throw new HttpError(409, "That email is already registered");

    try {
      const admin = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({ data: { name: body.companyName } });
        return tx.user.create({
          data: {
            email: body.email,
            name: body.fullName,
            passwordHash: await hashPassword(body.password),
            role: "HR_ADMIN",
            emailVerified: true,
            mustChangePassword: false,
            companyId: company.id,
            profile: { create: { company: body.companyName, title: "HR Admin", dept: "People" } },
          },
          select: { id: true, name: true, role: true },
        });
      });

      // existing architecture supports session issue — log them straight in
      await issueSession(admin.id, admin.role, false);
      return Response.json({ ok: true, role: admin.role, name: admin.name });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("Unique constraint") && msg.includes("Company")) {
        throw new HttpError(409, "A company with that name already exists");
      }
      if (msg.includes("Unique constraint") && msg.includes("email")) {
        throw new HttpError(409, "That email is already registered");
      }
      console.error("company signup failed", msg.slice(0, 200));
      throw new HttpError(500, "Could not create the organization");
    }
  } catch (e) {
    return errorResponse(e);
  }
}
