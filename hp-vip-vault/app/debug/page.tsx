import { getAppSessionClaims } from "@/lib/user/claims";

export default async function DebugPage() {
  
  const customClaims = await getAppSessionClaims();
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Debug – Session Claims
      </h1>

      <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm">
        {JSON.stringify(customClaims, null, 2)}
      </pre>
    </div>
  );
}
