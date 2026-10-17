"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route render error:", error);
  }, [error]);

  return (
    <>
      <nav className="fixed top-6 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-full border border-white/10 bg-neutral-900/60 px-8 py-3 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <Link href="/" className="group flex items-center gap-2 w-fit">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          <span className="text-lg font-black italic tracking-tighter uppercase text-white group-hover:text-orange-500 transition-colors">
            HP.VIP <span className="text-orange-500">Vault</span>
          </span>
        </Link>
      </nav>
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <AlertTriangle size={40} className="mx-auto text-primary" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase text-primary">Uplink Interrupted</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              Something went wrong rendering this page.
            </p>
            {error.digest && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700">
                Reference: {error.digest}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="vault" onClick={() => reset()}>
              Try Again
            </Button>
            <Link href="/cars" className="text-xs font-bold uppercase tracking-[0.3em] text-white underline underline-offset-8">
              Return to Vault
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
