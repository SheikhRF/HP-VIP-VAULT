import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="ui-overlay">
      <SignIn 
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