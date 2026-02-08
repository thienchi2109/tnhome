import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createProductImportTemplate } from "@/lib/product-import-template";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify admin authorization
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail =
    user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase() || "";
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Generate template and return as downloadable file
  try {
    const buffer = await createProductImportTemplate();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="tn-home-import-template.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
