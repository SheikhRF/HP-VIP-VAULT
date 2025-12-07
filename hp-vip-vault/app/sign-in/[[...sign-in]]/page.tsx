import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <SignIn 
      appearance={{
          elements: {
            // Primary button (Continue / Sign In)
            formButtonPrimary: {
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              borderRadius: "var(--radius-md)",
            },
            formButtonPrimaryHover: {
              backgroundColor: "var(--color-accent)", // same as primary for hover
            },

            // Input styling (optional)
            formFieldInput: {
              backgroundColor: "var(--color-input)",
              color: "var(--color-foreground)",
              border: `1px solid var(--color-border)`,
            },

            // The card (main container)
            card: {
              backgroundColor: "var(--color-card)",
              color: "var(--color-card-foreground)",
              borderRadius: "var(--radius-lg)",
              border: `1px solid var(--color-border)`,
            },

            // Title / Subtitle
            headerTitle: {
              color: "var(--color-foreground)",
            },
            headerSubtitle: {
              color: "var(--color-muted-foreground)",
            },

            // Links (forgot password, sign up link)
            formButtonText: {
              color: "var(--color-accent)",
            },
          },
        }}
      />
    </div>
  );
}