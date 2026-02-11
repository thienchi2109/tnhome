import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  signInWithOAuthMock,
  useSearchParamsMock,
  toastErrorMock,
  originalAppUrl,
} = vi.hoisted(() => ({
  signInWithOAuthMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  toastErrorMock: vi.fn(),
  originalAppUrl: process.env.NEXT_PUBLIC_APP_URL,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: signInWithOAuthMock,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
  },
}));

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

describe("GoogleSignInButton redirect flow", () => {
  beforeEach(() => {
    signInWithOAuthMock.mockReset();
    useSearchParamsMock.mockReset();
    toastErrorMock.mockReset();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3003";

    signInWithOAuthMock.mockResolvedValue({
      error: null,
    });
  });

  it("passes redirect_url through callback next param", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("redirect_url=%2Fadmin%3Ftab%3Dorders")
    );

    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục với Google/i }));

    await waitFor(() => expect(signInWithOAuthMock).toHaveBeenCalledTimes(1));
    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3003/auth/callback?next=%2Fadmin%3Ftab%3Dorders",
      },
    });
  });

  it("rejects unsafe absolute redirect_url and falls back to root", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("redirect_url=https%3A%2F%2Fevil.com%2Fadmin")
    );

    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục với Google/i }));

    await waitFor(() => expect(signInWithOAuthMock).toHaveBeenCalledTimes(1));
    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3003/auth/callback?next=%2F",
      },
    });
  });
});

afterAll(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});
