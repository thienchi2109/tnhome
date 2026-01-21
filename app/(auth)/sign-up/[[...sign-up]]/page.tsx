import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md mx-auto",
            card: "bg-card text-card-foreground shadow-xl rounded-xl border border-border p-8",
            headerTitle: "text-2xl font-bold tracking-tight text-foreground",
            headerSubtitle: "text-sm text-muted-foreground mt-2",
            socialButtonsBlockButton:
              "bg-background border border-border hover:bg-muted text-foreground transition-colors h-10",
            socialButtonsBlockButtonText: "font-medium",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground text-xs uppercase tracking-wider bg-card px-2",
            formFieldLabel: "text-sm font-medium text-foreground",
            formFieldInput:
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            formButtonPrimary:
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm",
            footerActionLink: "text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline",
            identityPreviewText: "text-foreground",
            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
          },
        }}
      />
    </div>
  );
}
