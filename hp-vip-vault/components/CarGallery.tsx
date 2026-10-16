"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VAULT_BLUR_PLACEHOLDER } from "@/lib/image";
import GalleryDots from "@/components/GalleryDots";
import Lightbox from "@/components/Lightbox";

export default function CarGallery({ pictures, title }: { pictures: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pictures.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = itemRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pictures.length]);

  const scrollToIndex = (index: number) => {
    itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (pictures.length === 0) {
    return (
      <section className="w-full py-4 border-y border-white/5 bg-black/20">
        <div className="h-[300px] md:h-[450px] flex items-center justify-center">
          <span className="text-gray-700 font-black uppercase text-[10px] tracking-widest">No visuals on file</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full overflow-hidden py-4 border-y border-white/5 bg-black/20">
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto px-6 no-scrollbar snap-x h-[300px] md:h-[450px] items-center justify-center"
        >
          {pictures.map((url, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => setLightboxIndex(i)}
              className="group relative h-full w-[280px] md:w-[420px] shrink-0 snap-center rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a] cursor-zoom-in"
            >
              <Image
                src={url}
                alt={`${title} — photo ${i + 1} of ${pictures.length}`}
                fill
                sizes="(min-width: 768px) 420px, 280px"
                placeholder="blur"
                blurDataURL={VAULT_BLUR_PLACEHOLDER}
                className="object-contain transition-transform duration-700 group-hover:scale-110 motion-reduce:group-hover:scale-100"
              />
            </div>
          ))}
        </div>

        {pictures.length > 1 && (
          <GalleryDots count={pictures.length} activeIndex={activeIndex} onSelect={scrollToIndex} />
        )}
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          pictures={pictures}
          title={title}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
