"use client";
import { useState } from "react";
import Image from "next/image";

export default function PromoBanner() {
  const [isOpen, setIsOpen] = useState(false);
  // Read from .env and split into an array, supporting comma-separated URLs
  const rawUrls = process.env.NEXT_PUBLIC_ALL_MENU || "";
  const promoImages = rawUrls.split(",").map(url => url.trim()).filter(url => url.length > 0);

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
            className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
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
            <div className="overflow-y-auto w-full h-full bg-black flex flex-col items-center">
              {promoImages.map((imgSrc, idx) => (
                <Image
                  key={idx}
                  src={imgSrc}
                  alt={`Promo Menu ${idx + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto object-contain border-b-2 border-black/20"
                  priority={idx === 0}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
