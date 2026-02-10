import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, onAuthStateChangeMock, unsubscribeMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signOut: vi.fn(),
    },
  }),
}));

import { AuthProvider, useAuth } from "@/lib/supabase/auth-context";

function AuthProbe() {
  const { user, isLoading } = useAuth();
  return (
    <div data-testid="auth-state">
      {isLoading ? "loading" : (user?.email ?? "anonymous")}
    </div>
  );
}

describe("AuthProvider session bootstrap", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    getSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    unsubscribeMock.mockReset();
    consoleErrorSpy.mockClear();

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });
  });

  it("hydrates user from current session", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: { id: "user_1", email: "admin@example.com" },
        },
      },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("auth-state")).toHaveTextContent(
        "admin@example.com"
      )
    );
  });

  it("falls back to anonymous when session bootstrap fails", async () => {
    getSessionMock.mockRejectedValue(new Error("network failed"));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous")
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
