import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="ui-overlay min-h-screen">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                borderRadius: "var(--radius-md)",
              },
              formFieldInput: {
                borderRadius: "var(--radius-md)",
              },
            },
          }}
        />
      </div>
    </>
  );
}
