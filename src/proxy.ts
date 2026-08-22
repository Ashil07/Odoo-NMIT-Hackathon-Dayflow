// page gate. cookie session checked before any page renders.
// api routes do their own db-backed checks; this is redirect sugar.
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "dayflow_session";
const HR_ONLY_PAGES = ["/people"];

async function readSession(req: NextRequest): Promise<{ sub: string; role: string; mcp: boolean } | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.sub && typeof payload.role === "string"
      ? { sub: payload.sub, role: payload.role, mcp: payload.mcp === true }
      : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const session = await readSession(req);
  const { pathname } = req.nextUrl;

  // signed in users never see the auth pages again
  if (pathname === "/" || pathname === "/signup") {
    if (session) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // no session, no app pages
  if (!session) return NextResponse.redirect(new URL("/", req.url));

  // temp-password users are locked to the change-password page
  if (session.mcp && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  // hr-only pages bounce employees back to their dashboard
  if (HR_ONLY_PAGES.some((p) => pathname.startsWith(p)) && session.role !== "HR_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
