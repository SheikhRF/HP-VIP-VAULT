import Navbar from "@/components/navbar";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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
  params: { car_id: string };
}) {
  const carId = Number(params.car_id);

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
              That car ID doesn’t exist (or you don’t have access).
            </p>
          </div>
        </main>
      </>
    );
  }

  const mainImage = car.pictures?.[0]; // because pictures is text[] now

  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground px-6 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: image */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative w-full aspect-[16/10] bg-black/30">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={`${car.make ?? ""} ${car.model ?? ""}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Optional thumbnails */}
            {Array.isArray(car.pictures) && car.pictures.length > 1 && (
              <div className="p-4 flex gap-3 overflow-auto">
                {car.pictures.slice(0, 6).map((url: string, i: number) => (
                  <div key={i} className="relative h-20 w-28 rounded-lg overflow-hidden border border-border">
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h1 className="text-3xl font-bold text-primary">
              {car.make ?? "—"} {car.model ?? ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {car.body_type ?? "—"} • {car.engine_power ?? "—"} • {car.max_speed ?? "—"}
            </p>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">Key specs</h2>
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
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">DVLA</h2>
              <SpecRow label="MOT" value={car.mot} />
              <SpecRow label="Tax status" value={car.tax_status} />
              <SpecRow label="Tax due" value={car.tax_due_date} />
              <SpecRow label="Year of manufacture" value={car.year_of_manufacture} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
