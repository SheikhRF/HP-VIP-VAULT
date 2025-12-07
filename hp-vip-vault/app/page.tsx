"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">

      <div className="text-center max-w-sm w-full">

        <h1 className="text-4xl font-bold text-primary mb-6">
          Enter the Vault
        </h1>

        <Link
          href="/home"
          className="inline-block bg-primary text-primary-foreground
                     px-6 py-3 rounded-lg text-lg font-semibold
                     hover:opacity-90 transition"
        >
          Enter
        </Link>

      </div>

    </div>
  );
}
