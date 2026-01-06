
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DebugSessionPage() {
  const authData = await auth();
  const user = await currentUser();
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Session Debug</h1>

      <h2 className="text-lg font-semibold mt-4">auth()</h2>
      <pre className="bg-card p-4 rounded-lg border border-border text-sm overflow-auto">
        {JSON.stringify(authData, null, 2)}
      </pre>

      <h2 className="text-lg font-semibold mt-6">currentUser()</h2>
      <pre className="bg-card p-4 rounded-lg border border-border text-sm overflow-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
