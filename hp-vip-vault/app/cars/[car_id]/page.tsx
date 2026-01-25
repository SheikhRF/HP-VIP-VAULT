import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SECRET_KEY");

  return createClient(url, key);
}

function SpecRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-right">{value ?? "—"}</span>
    </div>
  );
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ car_id: string }>;
}) {
  const { car_id } = await params;
  const carId = Number(car_id);

  if (!Number.isFinite(carId)) {
    return (
      <>
        <Navbar />
        <main className="bg-background text-foreground px-6 py-16">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-6">
            <h1 className="text-2xl font-bold text-primary">Invalid car id</h1>
            <p className="text-muted-foreground mt-2">
              The URL must be a numeric car_id.
            </p>
            <Link href="/cars" className="inline-block mt-4 text-primary hover:opacity-90">
              ← Back to cars
            </Link>
          </div>
        </main>
      </>
    );
  }

  const supabase = getSupabase();

  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("car_id", carId)
    .single();

  if (error || !car) {
    return (
      <>
        <Navbar />
        <main className="bg-background text-foreground px-6 py-16">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-6">
            <h1 className="text-2xl font-bold text-primary">Car not found</h1>
            <p className="text-muted-foreground mt-2">
              That car doesn’t exist .
            </p>
            <Link href="/cars" className="inline-block mt-4 text-primary hover:opacity-90">
              ← Back to cars
            </Link>
          </div>
        </main>
      </>
    );
  }

  const pictures: string[] = Array.isArray(car.pictures) ? car.pictures : [];
  const mainImage = pictures[0];

  const title = `${car.make ?? ""} ${car.model ?? ""}`.trim() || "Car";

  return (
    <>
      <Navbar />

      <main className="bg-background text-foreground px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {car.body_type ?? "—"}
                {car.engine_power ? ` • ${car.engine_power}` : ""}
                {car.max_speed ? ` • ${car.max_speed}` : ""}
              </p>
            </div>
            <Link
             href="/trips/add"
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 w-full sm:w-auto"
              >
              <Plus size={18} />
              <span>Add trip</span>
            </Link>

            <Link
              href="/cars"
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90 transition"
            >
              Back
            </Link>
            
          </div>

          <div className="">
            {/* Images */}
            <div className="mb-8">
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {pictures.slice(0, 10).map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="relative h-200 w-280 rounded-lg overflow-hidden border border-border flex-shrink-0"
                    >
                      <Image src={url} alt={`${title} photo ${i + 1}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>

            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-8">
              <section>
                <h2 className="font-semibold mb-3">Key specs</h2>
                <SpecRow label="Acceleration (0–100)" value={car.acceleration_0_100} />
                <SpecRow label="Body type" value={car.body_type} />
                <SpecRow label="Engine capacity" value={car.engine_capacity} />
                <SpecRow label="Curb weight" value={car.curb_weight} />
                <SpecRow label="Cylinder layout" value={car.cylinder_layout} />
                <SpecRow label="Drive wheels" value={car.drive_wheels} />
                <SpecRow label="Engine power" value={car.engine_power} />
                <SpecRow label="Max torque" value={car.max_torque} />
                <SpecRow label="Max speed" value={car.max_speed} />
                <SpecRow label="Fuel tank capacity" value={car.fuel_tank_capacity} />
                <SpecRow label="Gearbox type" value={car.gearbox_type} />
                <SpecRow label="Seats" value={car.number_of_seats} />
                <SpecRow label="Gears" value={car.number_of_gears} />
                <SpecRow label="Cylinders" value={car.number_of_cylinders} />
                <SpecRow label="Trunk capacity" value={car.max_trunk_capacity} />
              </section>

              <section>
                <h2 className="font-semibold mb-3">DVLA</h2>
                <SpecRow label="MOT" value={car.mot} />
                <SpecRow label="Tax status" value={car.tax_status} />
                <SpecRow label="Tax due" value={car.tax_due_date} />
                <SpecRow label="Year of manufacture" value={car.year_of_manufacture} />
              </section>

              <section>
                <h2 className="font-semibold mb-3">Other</h2>
                <SpecRow label="Registration" value={car.registration} />
                <SpecRow label="Mileage" value={car.mileage} />
                <SpecRow label="Price" value={car.price} />
                <SpecRow label="Location" value={car.location} />
              </section>
              
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
