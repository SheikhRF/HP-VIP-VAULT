import Navbar from "@/components/navbar";

export default function ContactPage() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">

      <div className="max-w-md w-full text-center space-y-6">
        <img
          src="HP-VIP-logo-round.png"
          alt="Contact Us"
          className="mx-auto mb-4 w-70 h-70"
        />
        <h1 className="text-4xl font-bold text-primary">
          Contact Us
        </h1>

        <p className="text-lg text-muted-foreground">
          Have any questions or need support?  
          We're here to help — feel free to reach out anytime.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <p className="text-xl font-semibold text-card-foreground">
            Email:
          </p>

          <a
            href="mailto:info@horsepower.vip"
            className="text-primary hover:underline"
          >
            info@horsepower.vip
          </a>
        </div>

      </div>

    </div>
    </>
  );
}
