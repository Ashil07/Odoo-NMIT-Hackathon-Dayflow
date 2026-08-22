// payable days for one month. unpaid leave and missing attendance cut the count.
import { prisma } from "@/lib/db";

export type PayableDays = {
  workingDays: number;
  unpaidDays: number;
  absentDays: number;
  lossDays: number;
  payableDays: number;
};

const key = (d: Date) => d.toISOString().slice(0, 10);

// mon-fri only, weekends are never payable days
const isWorkday = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

// every weekday in the month, as iso keys
function monthWorkdays(year: number, month: number): string[] {
  const out: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (isWorkday(d)) out.push(key(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// approved unpaid leave + absent days knock days off the payslip
export async function payableDaysFor(userId: string, when = new Date()): Promise<PayableDays> {
  const year = when.getFullYear();
  const month = when.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const workdays = new Set(monthWorkdays(year, month));

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId, type: "Unpaid", status: "Approved", from: { lt: end }, to: { gte: start } },
    select: { from: true, to: true },
  });

  // walk each approved unpaid range, keep the weekdays that land in this month
  const unpaid = new Set<string>();
  for (const row of leaves) {
    const d = new Date(row.from.getFullYear(), row.from.getMonth(), row.from.getDate());
    const last = new Date(row.to.getFullYear(), row.to.getMonth(), row.to.getDate());
    while (d <= last) {
      const k = key(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12));
      if (workdays.has(k)) unpaid.add(k);
      d.setDate(d.getDate() + 1);
    }
  }

  const rows = await prisma.attendance.findMany({
    where: { userId, day: { gte: start, lt: end }, status: "Absent" },
    select: { day: true },
  });

  // absent days count too, unless the same day is already unpaid leave
  const absent = new Set<string>();
  for (const r of rows) {
    const k = key(new Date(r.day.getFullYear(), r.day.getMonth(), r.day.getDate(), 12));
    if (workdays.has(k) && !unpaid.has(k)) absent.add(k);
  }

  const workingDays = workdays.size;
  const lossDays = unpaid.size + absent.size;
  return {
    workingDays,
    unpaidDays: unpaid.size,
    absentDays: absent.size,
    lossDays,
    payableDays: Math.max(0, workingDays - lossDays),
  };
}
