"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function PromoBanner() {
    const [isOpen, setIsOpen] = useState(false);
    const promoImage = "https://caripromo.id/images/makanan/promo-makanan-dominos-pizza-hemat-gila.jpg"; // Using direct image since unsplash page URL won't work in img tag

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
                        onClick={e => e.stopPropagation()}
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
                        <div className="overflow-y-auto w-full h-full bg-black flex flex-col">
                            <Image
                                src={promoImage}
                                alt="Promo"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
