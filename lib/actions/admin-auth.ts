"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

// Admin email configuration
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail =
    user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase() || "";

  if (!ADMIN_EMAILS.includes(userEmail)) {
    throw new Error("Unauthorized");
  }

  return { userId, email: userEmail };
}
