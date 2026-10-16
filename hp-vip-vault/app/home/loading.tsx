import Navbar from "@/components/navbar";
import CarCardSkeleton from "@/components/CarCardSkeleton";

export default function HomeLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
        {/* Hero skeleton */}
        <section className="w-full max-w-7xl pt-32 pb-16 px-6 text-center space-y-4">
          <div className="h-16 md:h-24 w-3/4 mx-auto bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-3 w-40 mx-auto bg-white/5 rounded-full animate-pulse" />
        </section>

        <div className="w-full max-w-7xl px-6 space-y-24 pb-24">
          {/* New Deliveries skeleton */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-28 bg-white/5 rounded-full animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Instagram card skeleton */}
          <section className="bg-[#1a1a1a] border border-gray-800 rounded-[2rem] p-8 md:p-12 shadow-2xl">
            <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-8" />
            <div className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
          </section>
        </div>
      </main>
    </>
  );
}
