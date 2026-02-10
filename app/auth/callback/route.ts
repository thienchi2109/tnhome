import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_HOSTS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : null,
    "localhost:3003",
    "localhost:3000",
  ].filter(Boolean) as string[]
);

function resolveOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost || !ALLOWED_HOSTS.has(forwardedHost)) {
    return requestUrl.origin;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  return `${protocol}://${forwardedHost}`;
}

function normalizeNextPath(nextParam: string | null, origin: string) {
  let next = nextParam ?? "/";

  try {
    const parsed = new URL(next, origin);
    next = parsed.pathname;
  } catch {
    next = "/";
  }

  if (!next.startsWith("/")) {
    return "/";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = resolveOrigin(request);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeNextPath(requestUrl.searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=auth-callback-failed", origin)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Auth callback code exchange failed:", error.message);
    return NextResponse.redirect(
      new URL("/sign-in?error=auth-callback-failed", origin)
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
