
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Car = {
  car_id: number;
  make: string | null;
  model: string | null;
  pictures: string | null;
};

export default async function CarsPage() {
  // 1) Load cars from Supabase
  const { data, error } = await supabase
  .from("cars")
  .select("car_id, make, model, pictures");

const cars = data as Car[] | null;


  if (error) {
    console.error(error);
  }

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-background text-foreground px-6 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center backdrop-blur-md border border-border/40 rounded-xl px-10 py-8 shadow-2xl">The Collection</h1>

        <Link
          href="/cars/add"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
        >
          + Add Car
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-1">Failed to load cars</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && (!cars || cars.length === 0) && (
        <p className="text-muted">No cars yet. Click “Add Car” to create one.</p>
      )}

      {/* Grid of cars – 1 per row on mobile, 2 per row on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {cars?.map((car) => (
          <article
            key={car.car_id}
            className="bg-card border border-border rounded-lg overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="w-full h-48 bg-background flex items-center justify-center overflow-hidden">
              {car.pictures ? (
                <img
                  src={car.pictures}
                  alt={`${car.make ?? ""} ${car.model ?? ""}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted text-sm">No image</span>
              )}
            </div>

            {/* Text content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  {car.make} {car.model}
                </h2>
                {/* Add more info later (year, reg, status, etc.) */}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
    </>
  );
}
