// server auth core: bcrypt hashes, jose sessions, db-backed guards.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "dayflow_session";
const WEEK_SECONDS = 60 * 60 * 24 * 7;

// thrown by guards, caught by api wrapper -> json error
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET missing or too short");
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function checkPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

// drop an httpOnly cookie holding a signed session token
export async function issueSession(userId: string, role: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
  const token = await new SignJWT({ role, v: user?.tokenVersion ?? 0 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEEK_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

// bump the version: every token issued before now dies with the cookie
export async function endSession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
  (await cookies()).delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  empId: string;
  email: string;
  name: string;
  role: "EMPLOYEE" | "HR_ADMIN";
  emailVerified: boolean;
};

// token proves identity + version. role is always re-read from the db here.
export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const u = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!u || u.tokenVersion !== payload.v) return null;
    return {
      id: u.id,
      empId: u.empId,
      email: u.email,
      name: u.name,
      role: u.role,
      emailVerified: u.emailVerified,
    };
  } catch {
    return null;
  }
}

// any signed-in user, or 401
export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "Sign in required");
  return u;
}

// signed-in user whose db role is in the list, or 403
export async function requireRole(...roles: Array<"EMPLOYEE" | "HR_ADMIN">): Promise<SessionUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new HttpError(403, "Not allowed for your role");
  return u;
}

// turn thrown HttpError into a json response
export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error("api error", e);
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}
