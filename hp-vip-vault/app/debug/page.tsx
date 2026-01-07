"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);

        // Browser fetch -> includes Clerk cookies automatically
        const res = await fetch("/api/ninjas-test", {
          method: "GET",
          cache: "no-store",
        });

        setStatus(res.status);

        const text = await res.text();
        setRawText(text);

        try {
          setData(JSON.parse(text));
        } catch {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">
        API Ninjas Debug
      </h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4 text-sm">
        <div>
          <span className="text-muted">Request:</span> /api/ninjas-test
        </div>
        <div>
          <span className="text-muted">Status:</span>{" "}
          {status ?? (loading ? "Loading..." : "Unknown")}
        </div>
      </div>

      <pre className="bg-card border border-border rounded-lg p-4 text-sm overflow-auto">
        {data ? JSON.stringify(data, null, 2) : rawText}
      </pre>
    </main>
  );
}
