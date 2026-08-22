// workspace sign-up. the only public account-creation path, and it mints an
// HR admin — never an employee. employees are provisioned from /api/people by
// the admin this route creates.
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { errorResponse, hashPassword, HttpError } from "@/lib/auth";
import { buildEmpId, nextSerial } from "@/lib/empid";
import { parseBody, workspaceSignupSchema } from "@/lib/validators";
import { fmtDay } from "@/lib/format";

export async function POST(req: Request) {
  try {
    const body = await parseBody(workspaceSignupSchema, req);

    const dup = await prisma.user.findUnique({ where: { email: body.email }, select: { email: true } });
    if (dup) throw new HttpError(409, "That email is already registered");

    // first admin in, first admin served: one workspace per company name
    const taken = await prisma.profile.findFirst({
      where: { company: { equals: body.company, mode: "insensitive" } },
      select: { id: true },
    });
    if (taken) {
      throw new HttpError(409, "A workspace already exists for that company. Ask your HR admin for a Login ID.");
    }

    const now = new Date();
    const year = now.getFullYear();
    const name = `${body.firstName} ${body.lastName}`;
    const verifyToken = randomBytes(24).toString("hex");
    const passwordHash = await hashPassword(body.password);

    // retry covers a freak serial collision on the unique emp id
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const user = await prisma.$transaction(async (tx) => {
          const serial = await nextSerial(tx, year);
          const empId = buildEmpId(body.company, body.firstName, body.lastName, year, serial);
          return tx.user.create({
            data: {
              empId,
              email: body.email,
              name,
              passwordHash,
              role: "HR_ADMIN",
              emailVerified: false,
              verifyToken,
              mustChangePassword: false,
              profile: {
                create: {
                  company: body.company,
                  title: "HR Administrator",
                  dept: "People",
                  joined: `${fmtDay(now)} ${year}`,
                  joinedYear: year,
                  monthlyWage: 0,
                },
              },
            },
            select: { id: true, empId: true },
          });
        });

        // no mailer in this build: the link comes back so the flow completes.
        return Response.json({
          ok: true,
          admin: { name, empId: user.empId, email: body.email },
          verifyUrl: `/api/auth/verify?token=${verifyToken}`,
        });
      } catch (err) {
        const msg = String(err);
        if (msg.includes("Unique constraint") && msg.includes("empId") && attempt < 2) continue;
        if (msg.includes("Unique constraint") && msg.includes("email")) {
          throw new HttpError(409, "That email is already registered");
        }
        console.error("workspace signup failed", msg.slice(0, 200));
        throw new HttpError(500, "Could not create the workspace");
      }
    }
    throw new HttpError(500, "Employee ID generation failed, try again");
  } catch (e) {
    return errorResponse(e);
  }
}
