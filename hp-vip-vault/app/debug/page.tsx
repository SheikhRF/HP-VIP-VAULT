import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const h = await headers(); 
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    process.env.NODE_ENV === "development"
      ? "http"
      : (h.get("x-forwarded-proto") ?? "https");

  const apiUrl = `${proto}://${host}/api/ninjas-test`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  const text = await res.text();

  let parsed: any = null;
  let parseError: string | null = null;

  try {
    parsed = JSON.parse(text);
  } catch (e: any) {
    parseError = String(e?.message ?? e);
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">API Ninjas Debug</h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4 text-sm">
        <div><span className="text-muted">Request:</span> {apiUrl}</div>
        <div><span className="text-muted">HTTP status:</span> {res.status}</div>
        {parseError && (
          <div className="mt-2 text-red-400">
            JSON parse failed: {parseError}
          </div>
        )}
      </div>

      <pre className="bg-card border border-border rounded-lg p-4 text-sm overflow-auto">
        {parsed ? JSON.stringify(parsed, null, 2) : text}
      </pre>
    </main>
  );
}
