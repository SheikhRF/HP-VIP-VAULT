"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({
  pictures,
  title,
  initialIndex,
  onClose,
}: {
  pictures: string[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + pictures.length) % pictures.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % pictures.length);
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, pictures.length]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200 motion-reduce:animate-none"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {pictures.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + pictures.length) % pictures.length);
            }}
            className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors z-10 p-2"
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % pictures.length);
            }}
            className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors z-10 p-2"
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative w-full h-full max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={pictures[index]}
          alt={`${title} — photo ${index + 1} of ${pictures.length}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white/60">
        {index + 1} / {pictures.length}
      </div>
    </div>
  );
}
