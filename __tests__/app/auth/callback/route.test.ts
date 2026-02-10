import { beforeEach, describe, expect, it, vi } from "vitest";

const { exchangeCodeForSessionMock, createClientMock } = vi.hoisted(() => ({
  exchangeCodeForSessionMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "@/app/auth/callback/route";

function getLocation(response: Response) {
  const location = response.headers.get("location");
  expect(location).toBeTruthy();
  return new URL(location!, "http://localhost:3003");
}

describe("auth callback route", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3003";
    exchangeCodeForSessionMock.mockReset();
    createClientMock.mockReset();

    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: exchangeCodeForSessionMock,
      },
    });
  });

  it("redirects to relative next path after successful exchange", async () => {
    const request = new Request(
      "http://localhost:3003/auth/callback?code=ok&next=%2Fadmin"
    );

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/admin");
    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("ok");
  });

  it("normalizes absolute same-host next URL to its pathname", async () => {
    const request = new Request(
      "http://localhost:3003/auth/callback?code=ok&next=http%3A%2F%2Flocalhost%3A3003%2Fadmin%3Ffrom%3Dcheckout"
    );

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/admin");
    expect(location.search).toBe("");
  });

  it("defaults to home path when next is missing", async () => {
    const request = new Request("http://localhost:3003/auth/callback?code=ok");

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/");
  });

  it("rejects external next URLs and redirects to home path", async () => {
    const request = new Request(
      "http://localhost:3003/auth/callback?code=ok&next=https%3A%2F%2Fevil.example%2Fsteal"
    );

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/");
  });

  it("redirects to error page when code is missing", async () => {
    const request = new Request("http://localhost:3003/auth/callback?next=%2Fadmin");

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("error")).toBe("auth-callback-failed");
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
  });

  it("redirects to error page when code exchange fails", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      error: { message: "invalid code" },
    });

    const request = new Request("http://localhost:3003/auth/callback?code=bad");

    const response = await GET(request);
    const location = getLocation(response);

    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("error")).toBe("auth-callback-failed");
  });
});
