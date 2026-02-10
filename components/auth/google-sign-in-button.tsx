"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function resolveAppOrigin() {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredAppUrl) {
    return window.location.origin;
  }

  try {
    return new URL(configuredAppUrl).origin;
  } catch {
    return window.location.origin;
  }
}

function normalizeRedirectPath(rawRedirect: string | null, origin: string) {
  const defaultPath = "/";
  if (!rawRedirect) {
    return defaultPath;
  }

  try {
    const parsed = new URL(rawRedirect, origin);
    const isAbsoluteHttpUrl =
      rawRedirect.startsWith("http://") || rawRedirect.startsWith("https://");

    if (isAbsoluteHttpUrl && parsed.origin !== origin) {
      return defaultPath;
    }

    const nextPath = `${parsed.pathname}${parsed.search}`;
    return nextPath.startsWith("/") ? nextPath : defaultPath;
  } catch {
    return rawRedirect.startsWith("/") ? rawRedirect : defaultPath;
  }
}

export function GoogleSignInButton() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);

    const origin = resolveAppOrigin();
    const redirectPath = normalizeRedirectPath(
      searchParams.get("redirect_url"),
      origin
    );
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      toast.error("Không thể chuyển hướng đăng nhập bằng Google");
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full rounded-xl border border-border/70 text-sm font-medium"
      disabled={isLoading}
      onClick={() => {
        void handleSignIn();
      }}
    >
      {isLoading ? (
        "Đang chuyển hướng..."
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"
            />
            <path
              fill="#34A853"
              d="M3.6 7.3l3.2 2.4c.9-1.8 2.8-3 5.2-3 1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 8.4 2.5 5.2 4.5 3.6 7.3z"
            />
            <path
              fill="#4A90E2"
              d="M12 21.5c2.5 0 4.7-.8 6.3-2.3l-3-2.4c-.8.6-2 1.1-3.3 1.1-2.5 0-4.6-1.7-5.3-4l-3.3 2.6c1.6 3.1 4.8 5 8.6 5z"
            />
            <path
              fill="#FBBC05"
              d="M6.7 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.4 7.6C2.9 8.9 2.6 10.4 2.6 12s.3 3.1.8 4.4l3.3-2.5z"
            />
          </svg>
          Tiếp tục với Google
        </>
      )}
    </Button>
  );
}
