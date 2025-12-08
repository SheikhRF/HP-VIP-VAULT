// app/test-supabase/page.tsx
import { createServerClient } from "@/lib/supabaseServer";
import Navbar from "@/components/navbar";
export default async function TestSupabasePage() {
  const supabase = createServerClient();

  // Query the cars table
  const { data: cars, error } = await supabase
    .from("cars")
    .select("*")
    .limit(10); // small test limit

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        Supabase Test Page
      </h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-4">
          <p>Error querying Supabase:</p>
          <pre>{error.message}</pre>
        </div>
      )}

      <pre className="bg-card p-6 rounded-lg border border-border text-sm">
        {JSON.stringify(cars, null, 2)}
      </pre>
    </div>
    </>
  );
  
}
