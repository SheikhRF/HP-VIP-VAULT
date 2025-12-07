import Navbar from "@/components/navbar";
import { InstagramEmbed } from "@/components/InstagramEmbed";
export default function Home(){
  return(
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center bg-background text-foreground py 24 px-4">

          {/*instagram stuff to be integrated here later*/}
          <div style = {{marginTop: "100px" }} className="w-full max-w-5x1 mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 text-center">Instagram</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-theme">
                {/* Placeholder image cards */}
                {[1, 2, 3].map((item) => (
              <div key={item} className="aspect-square bg-card rounded-md">
                <InstagramEmbed url="https://www.instagram.com/p/DLf_0oPofmF/?utm_source=ig_embed&amp;utm_campaign=loading" />
              </div>
            ))}
          </div>
          </div>
        
        {/* New Deliveries Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">New deliveries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-theme">
            {/* Placeholder new delivery cards */}
            {[1, 2].map((item) => (
              <div key={item} className="aspect-video bg-card rounded-md"></div>
            ))}
          </div>
          <div style={{ height: '500px' }} /> {/* Spacer for scrolling */}
        </div>
      
      </main>
    </>
  )
}