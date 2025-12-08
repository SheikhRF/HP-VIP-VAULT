import Navbar from "@/components/navbar";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const INSTAGRAM_POSTS = [
    "https://www.instagram.com/p/DLf_0oPofmF/?utm_source=ig_embed&amp;utm_campaign=loading",
    "https://www.instagram.com/p/DR2v02BjWye/?utm_source=ig_embed&amp;utm_campaign=loading",
    "https://www.instagram.com/p/DPR2b3sAJnc/?utm_source=ig_embed&amp;utm_campaign=loading"
]

type Car = {
  car_id: number;
  make: string | null;
  model: string | null;
  pictures: string | null;
};

const { data, error } = await supabase
  .from("cars")
  .select("car_id, make, model, pictures");

const cars = data as Car[] | null;


  if (error) {
    console.error(error);
  }
export default function Home(){
  return(
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center bg-background text-foreground py 24 px-4">

          {/*instagram stuff to be integrated here later*/}
          <div style = {{marginTop: "100px" }} className="w-full max-w-5x1 mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4 text-center backdrop-blur-md border border-border/40 rounded-xl px-10 py-8 shadow-2xl ">Instagram</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-theme">
                {INSTAGRAM_POSTS.map((url) => (
                <InstagramEmbed key={url} url={url} />
            ))}
          </div>
          </div>
        
        {/* New Deliveries Section */}
        <div className="w-full">
          <h2 className="text-4xl font-bold text-primary mb-4 text-center backdrop-blur-md border border-border/40 rounded-xl px-10 py-8 shadow-2xl">New deliveries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-theme">
        {cars?.map((car) => (
          <article
            key={car.car_id}
            className="aspect-video bg-card rounded-md border border-border flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div className="w-full h-[400] bg-background flex items-center justify-center overflow-hidden">
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
          <div style={{ height: '500px' }} /> {/* Spacer for scrolling */}
        </div>
        </div>
        
      </main>
    </>
  )
}
