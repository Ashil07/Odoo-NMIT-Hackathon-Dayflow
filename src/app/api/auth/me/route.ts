// who am i. role read fresh from the db every call.
import { prisma } from "@/lib/db";
import { currentUser, errorResponse } from "@/lib/auth";
import type { Me } from "@/lib/types";

export async function GET() {
  try {
    const session = await currentUser();
    if (!session) return Response.json({ error: "Sign in required" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true },
    });
    if (!user || !user.profile) return Response.json({ error: "Sign in required" }, { status: 401 });

    const me: Me = {
      id: user.id,
      empId: user.empId,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      mustChangePassword: user.mustChangePassword,
      profile: {
        title: user.profile.title,
        dept: user.profile.dept,
        manager: user.profile.manager,
        joined: user.profile.joined,
        location: user.profile.location,
        phone: user.profile.phone,
        address: user.profile.address,
        monthlyWage: user.profile.monthlyWage,
      },
    };
    return Response.json({ me });
  } catch (e) {
    return errorResponse(e);
  }
}
