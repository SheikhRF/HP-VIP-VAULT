"use client";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCarPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [pictures, setPictures] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        make,
        model,
        pictures: pictures,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Failed to add car");
      return;
    }

    // On success, go back to the cars page
    router.push("/cars");
    router.refresh();
  }

  return (
    <>
    <Navbar />
    <main className="bg-background text-foreground px-6 py-20 flex justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-primary">Add a Car</h1>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 px-3 py-2 rounded-md mb-3 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Make</label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full bg-input text-foreground border border-border rounded-md px-3 py-2 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-input text-foreground border border-border rounded-md px-3 py-2 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Pictures</label>
            <input
              type="url"
              value={pictures}
              onChange={(e) => setPictures(e.target.value)}
              className="w-full bg-input text-foreground border border-border rounded-md px-3 py-2 outline-none"
              placeholder="https://example.com/car.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Car"}
          </button>
        </form>
      </div>
    </main>
    </>
  );
}
