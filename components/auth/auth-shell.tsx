import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  heading: string;
  description: string;
  highlights: string[];
};

export function AuthShell({
  children,
  eyebrow,
  heading,
  description,
  highlights,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_72%_at_8%_8%,oklch(0.94_0.03_75)_0%,transparent_58%),radial-gradient(94%_68%_at_92%_2%,oklch(0.91_0.05_45)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-28 bottom-[-7rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-[-7rem] h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <section className="hidden rounded-[2rem] border border-border/60 bg-card/80 p-10 shadow-[0_35px_90px_-55px_oklch(0.2_0.01_50_/_0.65)] backdrop-blur-sm lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="max-w-md text-4xl font-semibold tracking-[-0.03em] text-foreground">
                {heading}
              </h1>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <ul className="space-y-3 pt-8">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mx-auto flex w-full max-w-xl flex-col justify-center">
            <div className="mb-5 rounded-3xl border border-border/60 bg-card/85 p-6 shadow-[0_28px_80px_-60px_oklch(0.2_0.01_50_/_0.6)] backdrop-blur-sm lg:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                {heading}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <div className="rounded-[2rem] border border-border/60 bg-card/80 p-2 shadow-[0_35px_90px_-55px_oklch(0.2_0.01_50_/_0.65)] backdrop-blur-sm">
              <div className="rounded-[1.7rem] bg-card/95 p-4 sm:p-6">{children}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
