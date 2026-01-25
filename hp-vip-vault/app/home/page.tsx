import Navbar from "@/components/navbar";
import { createClient } from "@supabase/supabase-js";
import { getFirstName } from "@/lib/user/claims";
import InstagramWidget from "@/components/InstagramWidget";
import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

type Car = {
  car_id: number;
  make: string | null;
  model: string | null;
  pictures: string[] | null; // Changed to string[] to match your API output
};

export default async function Home() {
  // Fetch data directly inside the Server Component for speed
  const { data, error } = await supabase
    .from("cars")
    .select("car_id, make, model, pictures")
    .order('car_id', { ascending: false })
    .limit(4);

  const cars = data as Car[] | null;
  if (error) console.error(error);

  const firstName = await getFirstName();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
        
        {/* Hero Section: Sleek & Centered */}
        <section className="w-full max-w-7xl pt-32 pb-16 px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">
            Welcome to <span className="text-primary underline decoration-8 underline-offset-12">The Vault</span>
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.5em] font-bold">
            {firstName || "Guest"}
          </p>
        </section>

        {/* Content Wrapper */}
        <div className="w-full max-w-7xl px-6 space-y-24 pb-24">
          
          {/* New Deliveries: Modern Grid */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">New Deliveries</h2>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Recent Acquisitions</p>
              </div>
              <Link href="/cars" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1">
                View Full Fleet <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cars?.map((car) => (
                <Link 
                  href={`/cars/${car.car_id}`} 
                  key={car.car_id}
                  className="group relative aspect-[4/5] bg-[#1a1a1a] rounded-3xl border border-border overflow-hidden transition-all hover:border-primary/50 hover:scale-[1.02] shadow-2xl"
                >
                  {/* Image with Dark Overlay */}
                  <div className="absolute inset-0 z-0">
                    {car.pictures?.[0] ? (
                      <img
                        src={car.pictures[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-card">
                        <span className="text-muted text-[10px] uppercase font-bold tracking-widest">No Intel</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>

                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">{car.make}</p>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
                      {car.model}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Instagram Section: Glassmorphism Card */}
          <section className="bg-[#1a1a1a] border border-gray-800 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <h2 className="text-9xl font-black italic uppercase tracking-tighter">FEED</h2>
            </div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Instagram</h2>
                <p className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold">@horespower.vip </p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 p-4 backdrop-blur-sm">
                <InstagramWidget />
              </div>
            </div>
          </section>

        </div>
        {/* System Footer */}
        <footer className="w-full py-12 border-t border-gray-900 text-center">
          <p className="text-[9px] text-gray-800 font-black uppercase tracking-[0.6em]">
            HORSEPOWER.VIP 2026. 
          </p>
        </footer>
      </main>
    </>
  );
}