import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_PROTOCOLS = new Set(["http", "https"]);

const ALLOWED_HOSTS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : null,
    ...(process.env.NODE_ENV === "development"
      ? ["localhost:3003", "localhost:3000"]
      : []),
  ].filter(Boolean) as string[]
);

function resolveOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost || !ALLOWED_HOSTS.has(forwardedHost)) {
    return requestUrl.origin;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol =
    forwardedProto && ALLOWED_PROTOCOLS.has(forwardedProto)
      ? forwardedProto
      : requestUrl.protocol.replace(":", "");
  return `${protocol}://${forwardedHost}`;
}

function normalizeNextPath(nextParam: string | null, origin: string) {
  const defaultPath = "/";
  const next = nextParam ?? defaultPath;

  try {
    const parsed = new URL(next);
    const originHost = new URL(origin).host;
    if (parsed.host !== originHost) {
      return defaultPath;
    }
    return parsed.pathname.startsWith("/") ? `${parsed.pathname}${parsed.search}` : defaultPath;
  } catch {
    // Not an absolute URL, treat it as a relative candidate.
    if (!next.startsWith("/") || next.startsWith("//")) {
      return defaultPath;
    }
    return next;
  }
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
