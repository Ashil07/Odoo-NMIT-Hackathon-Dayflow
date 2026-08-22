// demo world: two demo logins, six colleagues, attendance + leave history.
// run: npx tsx prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { ATT_LOG, PEOPLE, SEED_REQUESTS } from "../src/lib/dayflow";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PASSWORD = "dayflow2026";

// aug dates in 2026, local midnight
function aug(day: number, hour?: number, minute?: number): Date {
  const d = new Date(2026, 7, day);
  if (hour !== undefined) d.setHours(hour, minute ?? 0, 0, 0);
  return d;
}

async function upsertUser(opts: {
  empId: string;
  email: string;
  name: string;
  role: "EMPLOYEE" | "HR_ADMIN";
  passwordHash: string;
  title: string;
  dept: string;
  manager: string;
  joined: string;
  location: string;
  wage: number;
}) {
  return prisma.user.upsert({
    where: { email: opts.email },
    create: {
      empId: opts.empId,
      email: opts.email,
      name: opts.name,
      role: opts.role,
      passwordHash: opts.passwordHash,
      emailVerified: true,
      profile: {
        create: {
          title: opts.title,
          dept: opts.dept,
          manager: opts.manager,
          joined: opts.joined,
          location: opts.location,
          phone: "+91 98450 11234",
          address: "12B Ashwin Residency, Indiranagar, Bengaluru 560038",
          monthlyWage: opts.wage,
        },
      },
    },
    update: { role: opts.role, passwordHash: opts.passwordHash, emailVerified: true },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const byEmail = (p: (typeof PEOPLE)[number]) => `${p.name.split(" ")[0].toLowerCase()}.${p.name.split(" ")[1].toLowerCase()}@dayflow.co`;

  // aarav (employee demo login) + tanvi (hr demo login) first
  const aaravSeed = PEOPLE.find((p) => p.name === "Aarav Rao")!;
  const tanviSeed = PEOPLE.find((p) => p.name === "Tanvi Nair")!;

  const aarav = await upsertUser({
    empId: aaravSeed.login, email: "aarav.rao@dayflow.co", name: aaravSeed.name,
    role: "EMPLOYEE", passwordHash, title: aaravSeed.role, dept: aaravSeed.dept,
    manager: aaravSeed.mgr, joined: aaravSeed.joined, location: aaravSeed.loc, wage: 50000,
  });
  const tanvi = await upsertUser({
    empId: tanviSeed.login, email: "tanvi.nair@dayflow.co", name: tanviSeed.name,
    role: "HR_ADMIN", passwordHash, title: tanviSeed.role, dept: tanviSeed.dept,
    manager: tanviSeed.mgr, joined: tanviSeed.joined, location: tanviSeed.loc, wage: 60000,
  });

  const others: Record<string, string> = {};
  for (const p of PEOPLE) {
    if (p.name === "Aarav Rao" || p.name === "Tanvi Nair") continue;
    const u = await upsertUser({
      empId: p.login, email: byEmail(p), name: p.name,
      role: "EMPLOYEE", passwordHash, title: p.role, dept: p.dept,
      manager: p.mgr, joined: p.joined, location: p.loc, wage: 45000 + (p.id.length % 5) * 5000,
    });
    others[p.name] = u.id;
  }
  others["Aarav Rao"] = aarav.id;
  others["Tanvi Nair"] = tanvi.id;

  // aarav's log: seed the history rows (skip the old mock "today" row)
  const history = ATT_LOG.slice(1);
  for (const row of history) {
    const dayNum = Number(row.day.split(" ")[1]);
    await prisma.attendance.upsert({
      where: { userId_day: { userId: aarav.id, day: aug(dayNum) } },
      create: {
        userId: aarav.id,
        day: aug(dayNum),
        inAt: row.in === "—" ? null : aug(dayNum, Number(row.in.split(":")[0]), Number(row.in.split(":")[1])),
        outAt: row.out === "—" ? null : aug(dayNum, Number(row.out.split(":")[0]), Number(row.out.split(":")[1])),
        status: row.status,
      },
      update: {},
    });
  }

  // everyone else punched in on the real today, per the mock statuses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const p of PEOPLE) {
    if (p.st === "Absent" || p.st === "Leave") continue;
    const uid = others[p.name];
    const inH = Number(p.in.split(":")[0]);
    const inM = Number(p.in.split(":")[1]);
    await prisma.attendance.upsert({
      where: { userId_day: { userId: uid, day: today } },
      create: {
        userId: uid,
        day: today,
        inAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), inH, inM),
        outAt:
          p.out === "—"
            ? null
            : new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                Number(p.out.split(":")[0]),
                Number(p.out.split(":")[1]),
              ),
        status: p.st,
      },
      update: {},
    });
  }

  // leave requests, mapped onto real users
  for (const r of SEED_REQUESTS) {
    const uid = others[r.who];
    if (!uid) continue;
    const existing = await prisma.leaveRequest.findFirst({ where: { userId: uid, type: r.type.split(" ")[0], days: r.days } });
    if (existing) continue;
    await prisma.leaveRequest.create({
      data: {
        userId: uid,
        type: r.type.startsWith("Paid") ? "Paid" : r.type.startsWith("Sick") ? "Sick" : "Unpaid",
        from: new Date(2026, 7, 24),
        to: new Date(2026, 7, 23 + r.days),
        days: r.days,
        status: r.status,
        remarks: r.note,
        decisionNote: r.status === "Pending" ? null : r.note,
        decidedById: r.status === "Pending" ? null : tanvi.id,
        attachment: r.attach ?? null,
        createdAt: new Date(2026, 7, 20, 10, 0, 0),
      },
    });
  }

  // one fresh unverified signup to demo the verification flow
  await prisma.user.upsert({
    where: { email: "new.hire@dayflow.co" },
    create: {
      empId: "OINEHI20260099",
      email: "new.hire@dayflow.co",
      name: "New Hire",
      passwordHash,
      role: "EMPLOYEE",
      verifyToken: randomBytes(24).toString("hex"),
      profile: { create: {} },
    },
    update: {},
  });

  console.log("seeded:", { aarav: aarav.email, tanvi: tanvi.email, password: DEMO_PASSWORD });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
