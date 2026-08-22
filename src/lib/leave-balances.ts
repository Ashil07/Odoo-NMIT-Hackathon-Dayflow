// server-side balance math. caps live in entitlements.ts, shared with the ui.
import { prisma } from "@/lib/db";
import { ENTITLEMENTS, isBalanceType } from "@/lib/entitlements";

export { ENTITLEMENTS };

// approved days already burned for this user and type
export async function usedDays(userId: string, type: string): Promise<number> {
  const rows = await prisma.leaveRequest.findMany({
    where: { userId, type, status: "Approved" },
    select: { days: true },
  });
  return rows.reduce((n, r) => n + r.days, 0);
}

// entitled minus burned. unpaid reports infinity, caller never blocks it
export async function daysLeft(userId: string, type: string): Promise<number> {
  if (!isBalanceType(type)) return Number.POSITIVE_INFINITY;
  const used = await usedDays(userId, type);
  return Math.max(0, ENTITLEMENTS[type] - used);
}

// human line for a blocked request. zero balance means pick another type
export function balanceMessage(type: string, left: number, days: number): string {
  const cap = ENTITLEMENTS[type as keyof typeof ENTITLEMENTS];
  const kind = type.toLowerCase();
  if (left <= 0) return `You are out of ${kind} leave, kindly select another option`;
  return `Only ${left} of ${cap} ${kind} days left, this request needs ${days}`;
}
