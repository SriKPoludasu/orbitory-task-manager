import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDemoCurrentUser, isDemoEmail } from "@/lib/demo-fallback";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          include: { workspace: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (user) return user;
  } catch {
    if (!isDemoEmail(session.user.email)) throw new Error("Database is unavailable.");
  }

  if (isDemoEmail(session.user.email)) {
    return getDemoCurrentUser() as never;
  }

  return null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
