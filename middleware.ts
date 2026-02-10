import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Admin emails allowed to access /admin routes
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

function isProtectedRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default async function middleware(req: NextRequest) {
  const { user, supabaseResponse } = await updateSession(req);

  if (isProtectedRoute(req.nextUrl.pathname)) {
    if (!user) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set(
        "redirect_url",
        `${req.nextUrl.pathname}${req.nextUrl.search}`
      );
      return NextResponse.redirect(signInUrl);
    }

    const userEmail = user.email?.toLowerCase() ?? "";
    if (!ADMIN_EMAILS.includes(userEmail)) {
      const homeUrl = new URL("/", req.url);
      homeUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
