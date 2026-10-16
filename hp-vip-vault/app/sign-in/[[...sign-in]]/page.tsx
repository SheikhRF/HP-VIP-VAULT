import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import Reveal from "@/components/Reveal";
import SpeedBackdrop from "@/components/SpeedBackdrop";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden min-h-screen">
        <SpeedBackdrop variant="center" />
        <div className="ui-overlay min-h-screen">
          <Reveal>
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
          </Reveal>
        </div>
      </div>
    </>
  );
}
