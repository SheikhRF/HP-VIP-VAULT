export default function GalleryDots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`View photo ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === activeIndex ? "w-6 bg-orange-500" : "w-1.5 bg-white/20 hover:bg-white/40"
          }`}
        />
      ))}
    </div>
  );
}
