"use client";
import { useState } from "react";
import Image from "next/image";

const convertDriveUrl = (url) => {
  if (!url) return url;
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

export default function PromoBanner() {
  const [isOpen, setIsOpen] = useState(false);
  // Read from .env and split into an array, supporting comma-separated URLs
  const rawUrls = process.env.NEXT_PUBLIC_ALL_MENU || "";
  const promoImages = rawUrls.split(",").map(url => convertDriveUrl(url.trim())).filter(url => url.length > 0);

  if (promoImages.length === 0) return null; // Don't show button if no images configured!

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu image"
        className="
    fixed bottom-5 right-5 z-40
    flex items-center gap-2
    rounded-full bg-primary px-4 py-2
    text-sm font-medium text-white
    shadow-lg
    transition-all
    hover:bg-orange-600 hover:shadow-xl
    active:scale-95
  "
      >
        <span className="text-base">📝</span>
        <span>Buka semua menu</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fadeIn p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close Button */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Container */}
            <div 
              className="overflow-x-auto overflow-y-hidden w-full h-full bg-black flex flex-row snap-x snap-mandatory" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {promoImages.map((imgSrc, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center">
                  <Image
                    src={imgSrc}
                    alt={`Promo Menu ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-contain"
                    priority={idx === 0}
                    quality={50} // Compress the image to save bandwidth
                  />
                </div>
              ))}
            </div>

            {/* Swipe Indicator */}
            {promoImages.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
                <span className="bg-black/60 backdrop-blur text-white text-[10px] uppercase tracking-wider px-4 py-2 rounded-full font-bold shadow-lg border border-white/10">
                  Geser 👉
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
