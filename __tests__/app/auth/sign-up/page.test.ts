import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import SignUpPage from "@/app/(auth)/sign-up/[[...sign-up]]/page";

describe("sign-up page redirect", () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it("preserves redirect_url query string when forwarding to sign-in", async () => {
    await SignUpPage({
      searchParams: Promise.resolve({
        redirect_url: "/admin?tab=orders",
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/sign-in?redirect_url=%2Fadmin%3Ftab%3Dorders"
    );
  });
});
