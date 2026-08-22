// request body shapes. one place, reused by every route.
import { z } from "zod";
import { HttpError } from "@/lib/auth";

// parse + validate a json body, throw 400 with the first issue
export async function parseBody<T extends z.ZodType>(schema: T, req: Request): Promise<z.output<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }
  return parsed.data;
}

export const passwordSchema = z
  .string()
  .min(8, "Password needs 8+ characters")
  .regex(/\d/, "Password needs at least one number");

export const signupSchema = z.object({
  empId: z.string().trim().min(3, "Employee ID needs 3+ characters").max(32).regex(/^[A-Za-z0-9]+$/, "Employee ID: letters and digits only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: passwordSchema,
  role: z.enum(["employee", "hr_admin"]),
  name: z.string().trim().min(2).max(64).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});

export const profilePatchSchema = z.strictObject({
  phone: z.string().trim().min(4).max(24).optional(),
  address: z.string().trim().min(4).max(200).optional(),
});

export const leaveApplySchema = z.object({
  type: z.enum(["Paid", "Sick", "Unpaid"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD"),
  remarks: z.string().trim().max(400).optional().default(""),
  attach: z.boolean().optional().default(false),
});

export const leaveDecideSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
  comment: z.string().trim().max(300).optional().default(""),
});

export const wagePatchSchema = z.object({
  monthlyWage: z.number().int().min(1000).max(10000000),
});

export const employeePatchSchema = z.strictObject({
  name: z.string().trim().min(2).max(64).optional(),
  title: z.string().trim().min(2).max(64).optional(),
  dept: z.string().trim().min(2).max(64).optional(),
  manager: z.string().trim().min(2).max(64).optional(),
  joined: z.string().trim().min(4).max(32).optional(),
  location: z.string().trim().min(2).max(64).optional(),
  phone: z.string().trim().min(4).max(24).optional(),
  address: z.string().trim().min(4).max(200).optional(),
});
