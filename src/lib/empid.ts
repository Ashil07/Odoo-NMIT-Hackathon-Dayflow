// employee id mint: OI + JODO + 2026 + 0001. serials from a locked counter row.
import type { PrismaClient } from "@/generated/prisma/client";

// both the raw client and a $transaction client satisfy this shape
type Tx = Pick<PrismaClient, "empIdCounter">;

// company prefix = first letter of first two words. "Odoo India" -> OI
export function companyPrefix(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) throw new Error("Company name required");
  const second = words[1]?.[0] ?? words[0][1] ?? "";
  return (words[0][0] + second).toUpperCase();
}

// name part = first 2 of first + first 2 of last, upper. "Jodo Doe" -> JODO
export function namePart(firstName: string, lastName: string): string {
  const f = firstName.trim().slice(0, 2);
  const l = lastName.trim().slice(0, 2);
  const part = (f + l).toUpperCase();
  if (part.length < 2) throw new Error("First and last name required");
  return part.padEnd(4, "X");
}

// atomically take the next serial for a joining year. row lock keeps
// two concurrent creators from ever seeing the same number.
export async function nextSerial(tx: Tx, year: number): Promise<number> {
  await tx.empIdCounter.upsert({
    where: { year },
    create: { year, lastSerial: 0 },
    update: {},
  });
  const row = await tx.empIdCounter.update({
    where: { year },
    data: { lastSerial: { increment: 1 } },
    select: { lastSerial: true },
  });
  return row.lastSerial;
}

export function buildEmpId(company: string, firstName: string, lastName: string, year: number, serial: number): string {
  const s = String(serial).padStart(4, "0");
  return `${companyPrefix(company)}${namePart(firstName, lastName)}${year}${s}`;
}

// readable random password: letters + digits, no lookalikes
export function tempPassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const digits = "23456789";
  const pick = (set: string, n: number) =>
    Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join("");
  return pick(alphabet, 6) + pick(digits, 2) + pick(alphabet, 2);
}
