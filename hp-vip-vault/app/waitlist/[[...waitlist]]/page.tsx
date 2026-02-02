import { Waitlist } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="ui-overlay">
      <Waitlist 
      appearance={{
          elements: {
            formButtonPrimary:{
                backgroundColor: "var(--color-primary)",
                color: "#ffffffff",
                borderRadius: "var(--radius-md)",
            },
            formFieldInput: {
              borderRadius: "var(--radius-md)",
            },
          },
        }}
      />
    </div>
  );
}