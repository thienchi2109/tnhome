import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const updateSessionMock = vi.fn();

type MiddlewareType = typeof import("@/middleware").default;
let middleware: MiddlewareType;

function createRequest(pathname: string, search = "") {
  return {
    url: `http://localhost:3003${pathname}${search}`,
    nextUrl: {
      pathname,
      search,
    },
  } as never;
}

function createSupabaseResponse() {
  const response = NextResponse.next();
  response.cookies.set("sb-access-token", "token_123");
  return response;
}

function getLocation(response: Response) {
  const location = response.headers.get("location");
  expect(location).toBeTruthy();
  return new URL(location!, "http://localhost:3003");
}

describe("middleware auth guards", () => {
  beforeEach(async () => {
    vi.resetModules();
    updateSessionMock.mockReset();
    process.env.ADMIN_EMAILS = "admin@example.com";

    vi.doMock("@/lib/supabase/middleware", () => ({
      updateSession: updateSessionMock,
    }));

    ({ default: middleware } = await import("@/middleware"));
  });

  it("redirects unauthenticated /admin users to sign-in", async () => {
    const supabaseResponse = createSupabaseResponse();
    updateSessionMock.mockResolvedValue({ user: null, supabaseResponse });

    const response = await middleware(createRequest("/admin"));
    const location = getLocation(response);

    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("redirect_url")).toBe("/admin");
    expect(response.cookies.get("sb-access-token")?.value).toBe("token_123");
  });

  it("redirects authenticated non-admin /admin users to unauthorized", async () => {
    const supabaseResponse = createSupabaseResponse();
    updateSessionMock.mockResolvedValue({
      user: { email: "user@example.com" },
      supabaseResponse,
    });

    const response = await middleware(createRequest("/admin", "?page=2"));
    const location = getLocation(response);

    expect(location.pathname).toBe("/");
    expect(location.searchParams.get("error")).toBe("unauthorized");
    expect(response.cookies.get("sb-access-token")?.value).toBe("token_123");
  });

  it("passes through authenticated admins on /admin routes", async () => {
    const supabaseResponse = createSupabaseResponse();
    updateSessionMock.mockResolvedValue({
      user: { email: "admin@example.com" },
      supabaseResponse,
    });

    const response = await middleware(createRequest("/admin/orders"));

    expect(response).toBe(supabaseResponse);
  });

  it("passes through non-admin routes regardless of auth state", async () => {
    const supabaseResponse = createSupabaseResponse();
    updateSessionMock.mockResolvedValue({ user: null, supabaseResponse });

    const response = await middleware(createRequest("/products", "?q=sofa"));

    expect(response).toBe(supabaseResponse);
  });
});
