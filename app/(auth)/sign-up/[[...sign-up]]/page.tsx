import { redirect } from "next/navigation";

type SignUpPageProps = {
  searchParams: Promise<{
    redirect_url?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectTarget = params.redirect_url
    ? `/sign-in?redirect_url=${encodeURIComponent(params.redirect_url)}`
    : "/sign-in";

  redirect(redirectTarget);
}
