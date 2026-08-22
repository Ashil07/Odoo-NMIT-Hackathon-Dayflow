// universal search. session role decides what even exists to find.
import { prisma } from "@/lib/db";
import { currentUser, errorResponse } from "@/lib/auth";
import { fmtDay, fmtRange, hhmm } from "@/lib/format";

export async function GET(req: Request) {
  try {
    const me = await currentUser();
    if (!me) return Response.json({ error: "Sign in required" }, { status: 401 });

    const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
    if (q.length < 2) return Response.json({ results: [] });
    const mode = { contains: q, mode: "insensitive" as const };

    // pages both roles can jump to
    const pages = (
      me.role === "HR_ADMIN"
        ? [
            { title: "Today at Dayflow", sub: "Dashboard", href: "/dashboard" },
            { title: "People", sub: "Directory", href: "/people" },
            { title: "Attendance", sub: "Company register", href: "/attendance" },
            { title: "Approvals", sub: "Leave queue", href: "/time-off" },
            { title: "Payroll", sub: "Salary structures", href: "/pay" },
          ]
        : [
            { title: "Dashboard", sub: "Your day", href: "/dashboard" },
            { title: "My attendance", sub: "Daily log", href: "/attendance" },
            { title: "Time off", sub: "Leave requests", href: "/time-off" },
            { title: "Pay", sub: "Salary + payslips", href: "/pay" },
            { title: "My profile", sub: "Your record", href: "/profile" },
          ]
    ).filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

    const results: Array<{ id: string; kind: string; title: string; sub: string; href: string; personId?: string }> =
      pages.map((p, i) => ({ id: "page" + i, kind: "page", title: p.title, sub: p.sub, href: p.href }));

    if (me.role === "HR_ADMIN") {
      // people by name, emp id, title, dept, location
      const people = await prisma.user.findMany({
        where: {
          OR: [
            { name: mode },
            { empId: mode },
            { profile: { is: { title: mode } } },
            { profile: { is: { dept: mode } } },
            { profile: { is: { location: mode } } },
          ],
        },
        include: { profile: true },
        take: 5,
        orderBy: { name: "asc" },
      });
      for (const p of people) {
        results.push({
          id: "person" + p.id,
          kind: "person",
          title: p.name,
          sub: `${p.profile?.title ?? "—"} · ${p.profile?.dept ?? "—"} · ${p.empId}`,
          href: "/people",
          personId: p.id,
        });
      }

      // leave requests by person, type or status
      const leaves = await prisma.leaveRequest.findMany({
        where: {
          OR: [{ type: mode }, { status: mode }, { user: { is: { name: mode } } }, { user: { is: { empId: mode } } }],
        },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 4,
      });
      for (const l of leaves) {
        results.push({
          id: "leave" + l.id,
          kind: "leave",
          title: `${l.user.name} · ${l.type} leave`,
          sub: `${fmtRange(l.from, l.to)} · ${l.status}`,
          href: "/time-off",
        });
      }
    } else {
      // employee: own record only
      const profile = await prisma.profile.findUnique({ where: { userId: me.id } });
      const haystack = [me.name, me.email, me.empId, profile?.title ?? "", profile?.dept ?? "", profile?.location ?? ""];
      if (haystack.some((f) => f.toLowerCase().includes(q.toLowerCase()))) {
        results.push({
          id: "profile",
          kind: "profile",
          title: me.name,
          sub: `${profile?.title ?? "—"} · ${me.empId} · your profile`,
          href: "/profile",
        });
      }

      const leaves = await prisma.leaveRequest.findMany({
        where: { userId: me.id, OR: [{ type: mode }, { status: mode }, { remarks: mode }] },
        orderBy: { createdAt: "desc" },
        take: 4,
      });
      for (const l of leaves) {
        results.push({
          id: "leave" + l.id,
          kind: "leave",
          title: `${l.type} leave`,
          sub: `${fmtRange(l.from, l.to)} · ${l.status}`,
          href: "/time-off",
        });
      }

      // own attendance by day text ("fri", "21", "aug") or status
      const att = await prisma.attendance.findMany({
        where: { userId: me.id },
        orderBy: { day: "desc" },
        take: 31,
      });
      for (const a of att) {
        if (results.length > 12) break;
        if (fmtDay(a.day).toLowerCase().includes(q.toLowerCase()) || a.status.toLowerCase().includes(q.toLowerCase())) {
          results.push({
            id: "day" + a.id,
            kind: "day",
            title: fmtDay(a.day),
            sub: `${a.status}${a.inAt ? " · in " + hhmm(a.inAt) : ""}`,
            href: "/attendance",
          });
        }
      }
    }

    return Response.json({ results: results.slice(0, 10) });
  } catch (e) {
    return errorResponse(e);
  }
}
