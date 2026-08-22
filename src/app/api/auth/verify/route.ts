// email verification. token in, verified flag set, bounce to sign-in.
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return Response.redirect(new URL("/login?verified=missing", req.url), 302);

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) return Response.redirect(new URL("/login?verified=bad", req.url), 302);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });
  return Response.redirect(new URL("/login?verified=ok", req.url), 302);
}
