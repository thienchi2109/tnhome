export const clerkAuthAppearance = {
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "w-full rounded-[1.75rem] border border-border/65 bg-card/95 p-6 shadow-none sm:p-8",
    headerTitle: "text-[1.85rem] font-semibold tracking-[-0.025em] text-foreground",
    headerSubtitle: "mt-2 text-sm leading-relaxed text-muted-foreground",
    socialButtonsBlockButton:
      "h-11 rounded-xl border border-border/75 bg-background/85 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background hover:shadow-sm",
    socialButtonsBlockButtonText: "text-sm font-medium",
    socialButtonsProviderIcon: "h-4 w-4",
    dividerLine: "bg-border/80",
    dividerText:
      "bg-card px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-11 rounded-xl border border-input bg-background/90 px-3 text-sm text-foreground shadow-none transition-all duration-200 placeholder:text-muted-foreground/90 focus:border-primary/35 focus:bg-background focus:ring-4 focus:ring-primary/10",
    formFieldInputShowPasswordButton:
      "text-muted-foreground transition-colors duration-200 hover:text-foreground",
    formButtonPrimary:
      "mt-1 h-11 rounded-xl bg-primary text-primary-foreground shadow-[0_16px_30px_-16px_oklch(0.25_0.02_260_/_0.8)] transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_22px_32px_-18px_oklch(0.25_0.02_260_/_0.9)]",
    footer: "mt-4",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink:
      "font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline",
    identityPreviewText: "text-foreground",
    formResendCodeLink:
      "font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline",
    otpCodeFieldInput:
      "h-11 rounded-xl border border-input bg-background text-foreground focus:border-primary/35 focus:ring-4 focus:ring-primary/10",
    alternativeMethodsBlockButton:
      "rounded-xl border border-border/75 bg-background/85 text-foreground transition-colors duration-200 hover:bg-background",
    alertText: "text-sm",
  },
};
