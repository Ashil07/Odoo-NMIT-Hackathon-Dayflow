// pure entitlement consts. client-safe, no server imports.
export const ENTITLEMENTS = { Paid: 24, Sick: 7 } as const;
export type BalanceType = keyof typeof ENTITLEMENTS;

// unpaid has no cap
export function isBalanceType(type: string): type is BalanceType {
  return type === "Paid" || type === "Sick";
}
