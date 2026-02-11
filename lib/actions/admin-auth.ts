"use server";

import { createClient } from "@/lib/supabase/server";
import { UnauthorizedError } from "./errors";

// Admin email configuration
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const userEmail = user.email?.toLowerCase() ?? "";

  if (!ADMIN_EMAILS.includes(userEmail)) {
    throw new UnauthorizedError();
  }

  return { userId, email: userEmail };
}
