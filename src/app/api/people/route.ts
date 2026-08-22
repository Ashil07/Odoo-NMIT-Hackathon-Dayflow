// whole-company register + directory in one payload. hr only.
// also: the one true employee-creation path. ids + passwords minted here.
import { prisma } from "@/lib/db";
import { errorResponse, hashPassword, HttpError, requireRole } from "@/lib/auth";
import { buildEmpId, nextSerial, tempPassword } from "@/lib/empid";
import { employeeCreateSchema, parseBody } from "@/lib/validators";
import { dayStart, hhmm, hrsBetween, fmtDay } from "@/lib/format";
import type { Person } from "@/lib/types";

export async function GET(req: Request) {
  try {
    await requireRole("HR_ADMIN");

    // optional day override, else today
    const dayParam = new URL(req.url).searchParams.get("day");
    const parsed = dayParam ? new Date(dayParam + "T00:00:00") : null;
    const today = parsed && !Number.isNaN(parsed.getTime()) ? parsed : dayStart();
    const [users, rows, leaves] = await Promise.all([
      prisma.user.findMany({ include: { profile: true }, orderBy: { name: "asc" } }),
      prisma.attendance.findMany({ where: { day: today } }),
      prisma.leaveRequest.findMany({ where: { status: "Approved" } }),
    ]);

    const attByUser = new Map(rows.map((r) => [r.userId, r]));
    const onLeave = new Set(
      leaves.filter((l) => l.from <= today && l.to >= today).map((l) => l.userId),
    );

    const people: Person[] = users.map((u) => {
      const a = attByUser.get(u.id);
      const hrs = a?.inAt && a?.outAt ? hrsBetween(a.inAt, a.outAt) : "—";
      const hNum = Number(hrs);
      const st = a
        ? a.status
        : onLeave.has(u.id)
          ? "Leave"
          : "Absent";
      return {
        id: u.id,
        empId: u.empId,
        name: u.name,
        role: u.profile?.title ?? "—",
        dept: u.profile?.dept ?? "—",
        st,
        in: a?.inAt ? hhmm(a.inAt) : "—",
        out: a?.outAt ? hhmm(a.outAt) : "—",
        hrs,
        extra: Number.isFinite(hNum) && hNum > 8.5 ? "+" + (hNum - 8.5).toFixed(1) : "—",
        mgr: u.profile?.manager ?? "—",
        joined: u.profile?.joined ?? "—",
        loc: u.profile?.location ?? "—",
        wage: u.profile?.monthlyWage ?? 0,
      };
    });
    return Response.json({ people, today: today.toISOString() });
  } catch (e) {
    return errorResponse(e);
  }
}

// hr provisions an employee: user + profile + minted id + temp password,
// all or nothing. plaintext password crosses the wire exactly once.
export async function POST(req: Request) {
  try {
    await requireRole("HR_ADMIN");
    const body = await parseBody(employeeCreateSchema, req);

    const dup = await prisma.user.findUnique({ where: { email: body.email }, select: { email: true } });
    if (dup) throw new HttpError(409, "That email is already registered");

    const joined = new Date(body.joiningDate + "T00:00:00");
    const year = joined.getFullYear();
    if (Number.isNaN(joined.getTime()) || year < 2000 || year > 2100) {
      throw new HttpError(400, "Joining date must be a real date between 2000 and 2100");
    }

    const name = `${body.firstName} ${body.lastName}`;
    let created: { id: string; empId: string } | null = null;

    // retry loop covers a freak serial collision on the unique emp id
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      const pw = tempPassword();
      try {
        created = await prisma.$transaction(async (tx) => {
          const serial = await nextSerial(tx, year);
          const empId = buildEmpId(body.company, body.firstName, body.lastName, year, serial);
          const user = await tx.user.create({
            data: {
              empId,
              email: body.email,
              name,
              passwordHash: await hashPassword(pw),
              role: body.role === "hr_admin" ? "HR_ADMIN" : "EMPLOYEE",
              emailVerified: true,
              mustChangePassword: true,
              profile: {
                create: {
                  company: body.company,
                  phone: body.phone,
                  joined: fmtDay(joined) + " " + year,
                  joinedYear: year,
                },
              },
            },
            select: { id: true, empId: true },
          });
          return user;
        });
        // one-time reveal, only on success
        return Response.json({ ok: true, employee: { id: created.id, name, empId: created.empId }, tempPassword: pw });
      } catch (err) {
        const msg = String(err);
        if (msg.includes("Unique constraint") && msg.includes("empId") && attempt < 2) continue;
        if (msg.includes("Unique constraint") && msg.includes("email")) {
          throw new HttpError(409, "That email is already registered");
        }
        console.error("employee create failed", msg.slice(0, 200));
        throw new HttpError(500, "Could not create the employee account");
      }
    }
    throw new HttpError(500, "Employee ID generation failed, try again");
  } catch (e) {
    return errorResponse(e);
  }
}
