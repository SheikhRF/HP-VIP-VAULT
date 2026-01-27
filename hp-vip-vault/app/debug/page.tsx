import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function DataCheckPage() {
  // 1. Check if variables are even loading into the server
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    return (
      <div style={{ padding: "50px", background: "black", color: "red", fontFamily: "monospace" }}>
        <h1>ENV ERROR</h1>
        <p>URL: {url ? "LOADED" : "MISSING"}</p>
        <p>SECRET: {secret ? "LOADED" : "MISSING"}</p>
        <p>Check your .env.local file and restart your terminal.</p>
      </div>
    );
  }

  const supabase = createClient(url, secret);

  // 2. Try to fetch from 'cars' table
  const { data: cars, error: carError } = await supabase.from("cars").select("*");

  // 3. Try to fetch from 'trips' table
  const { data: trips, error: tripError } = await supabase.from("trips").select("*");

  return (
    <div style={{ padding: "50px", background: "#111", color: "#eee", fontFamily: "monospace" }}>
      <h1 style={{ color: "orange" }}>DATA DIAGNOSTICS</h1>
      <hr style={{ borderColor: "#333" }} />

      <section style={{ marginTop: "30px" }}>
        <h2>TABLE: cars</h2>
        <p>Status: {carError ? `ERROR: ${carError.message}` : "SUCCESS"}</p>
        <p>Row Count: {cars?.length ?? 0}</p>
        <pre style={{ background: "#000", padding: "20px", borderRadius: "10px", overflow: "auto", maxHeight: "300px" }}>
          {JSON.stringify(cars, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>TABLE: trips</h2>
        <p>Status: {tripError ? `ERROR: ${tripError.message}` : "SUCCESS"}</p>
        <p>Row Count: {trips?.length ?? 0}</p>
        <pre style={{ background: "#000", padding: "20px", borderRadius: "10px", overflow: "auto", maxHeight: "300px" }}>
          {JSON.stringify(trips, null, 2)}
        </pre>
      </section>

      <div style={{ marginTop: "40px", fontSize: "12px", opacity: 0.5 }}>
        <p>Current URL being queried: {url}</p>
        <p>Secret Key starts with: {secret.substring(0, 10)}...</p>
      </div>
    </div>
  );
}