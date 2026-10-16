export default function CarCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] bg-black border border-white/5 rounded-[2.5rem] overflow-hidden">
      <div className="absolute inset-0 bg-white/5 animate-pulse" />
    </div>
  );
}
