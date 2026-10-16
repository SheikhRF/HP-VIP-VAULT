import Navbar from "@/components/navbar";
import CarCardSkeleton from "@/components/CarCardSkeleton";

export default function CarsLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white px-6 py-12 flex flex-col items-center">
        {/* Header skeleton */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-end justify-between mb-12 border-b border-white/5 pb-8 gap-6">
          <div className="space-y-3">
            <div className="h-12 md:h-16 w-72 bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-3 w-40 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-white/5 rounded-full animate-pulse" />
        </div>

        {/* Search bar skeleton */}
        <div className="w-full max-w-7xl mb-10">
          <div className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
