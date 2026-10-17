"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout render error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <h1 className="text-4xl font-black italic uppercase text-orange-500">Vault Offline</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Something went wrong loading the application.
              </p>
              {error.digest && (
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700">
                  Reference: {error.digest}
                </p>
              )}
            </div>
            <button
              onClick={() => reset()}
              className="bg-orange-500 text-black rounded-full font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 px-6 py-3 text-sm"
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
