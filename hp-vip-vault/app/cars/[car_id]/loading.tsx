import Navbar from "@/components/navbar";

export default function CarDetailLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-20">
        {/* Header skeleton */}
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-white/5 rounded-full animate-pulse mb-4" />
            <div className="h-12 md:h-16 w-96 max-w-full bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-3 w-56 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-14 w-40 bg-white/5 rounded-full animate-pulse" />
        </div>

        {/* Gallery skeleton — matches the real gallery's fixed height so there's no reflow */}
        <section className="w-full py-4 border-y border-white/5 bg-black/20">
          <div className="flex gap-4 px-6 h-[300px] md:h-[450px] items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="relative h-full w-[280px] md:w-[420px] shrink-0 rounded-[2rem] bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </section>

        {/* Technical briefing grid skeleton */}
        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 bg-white/5 border border-gray-800 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
          <div className="gap-8 grid flex flex-col items-start h-fit">
            <div className="h-48 w-full bg-white/5 rounded-[2.5rem] animate-pulse" />
            <div className="h-40 w-full bg-white/5 rounded-[2.5rem] animate-pulse" />
          </div>
        </div>
      </main>
    </>
  );
}
