import { redirect } from "next/navigation";

type SignUpPageProps = {
  searchParams: Promise<{
    redirect_url?: string;
  }>;
};

function normalizeRedirectPath(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "http://dummy");
    const path = parsed.pathname;
    return path.startsWith("/") ? path : "";
  } catch {
    return raw.startsWith("/") ? raw : "";
  }
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const validatedPath = normalizeRedirectPath(params.redirect_url);
  const redirectTarget = validatedPath
    ? `/sign-in?redirect_url=${encodeURIComponent(validatedPath)}`
    : "/sign-in";

  redirect(redirectTarget);
}
