"use client";
import { useState } from "react";

export default function MenuItem({ item }) {
    const [imageError, setImageError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const splitFirstSentence = (text = "") => {
        if (!text) return { first: "", rest: "" };

        const index = text.indexOf(".");
        if (index === -1) {
            return { first: text, rest: "" };
        }

        return {
            first: text.slice(0, index + 1),
            rest: text.slice(index + 1),
        };
    };

    return (
        <>
            {/* MENU CARD */}
            <div
                onClick={() => !item.isSoldOut && !imageError && item.image && setIsOpen(true)}
                className={`flex flex-row p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm 
                           border border-gray-100/50 transition-all group h-full relative overflow-hidden
                           ${item.isSoldOut ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-md active:scale-[0.99] cursor-pointer'}`}
            >
                {/* Left Content */}
                <div className="flex-1 flex flex-col min-w-0 pr-3 sm:pr-4">
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                            <h3 className="font-bold text-gray-900 text-[15px] sm:text-lg leading-snug line-clamp-2">
                                {item.name}
                            </h3>

                            <span className={`font-bold text-sm sm:hidden whitespace-nowrap ${item.isSoldOut ? 'text-gray-500 line-through' : 'text-primary'}`}>
                                Rp {parseInt(item.price).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-2">
                            <span className="font-bold text-gray-900">
                                {splitFirstSentence(item.description).first}
                            </span>
                            {splitFirstSentence(item.description).rest}
                        </p>
                    </div>

                    <div className="hidden sm:block mt-auto pt-2">
                        <span className={`font-bold text-base whitespace-nowrap px-3 py-1 rounded-lg inline-block
                            ${item.isSoldOut ? 'bg-gray-100 text-gray-500 line-through' : 'bg-orange-50 text-primary'}`}>
                            Rp {parseInt(item.price).toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>

                {/* Right Image / Text */}
                <div className="relative w-[88px] h-[88px] sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 
                                rounded-lg sm:rounded-xl overflow-hidden self-start border border-gray-100 
                                flex items-center justify-center text-center">
                    {!imageError && item.image && (
                        <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                setImageError(true);
                            }}
                        />
                    )}

                    {imageError && (
                        <span className="text-xs sm:text-sm text-gray-400 font-medium px-2">
                            Tidak ada gambar
                        </span>
                    )}

                    {/* Sold Out Badge */}
                    {item.isSoldOut && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="text-white text-xs sm:text-sm font-bold px-2 py-1 bg-red-600 rounded shadow-lg transform -rotate-6">
                                SOLD OUT
                            </span>
                        </div>
                    )}
                </div>
            </div >

            {/* MODAL IMAGE */}
            {
                isOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="relative max-w-3xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-4 -right-4 bg-white text-black 
                                       w-10 h-10 rounded-full flex items-center justify-center 
                                       shadow-lg text-xl font-bold"
                            >
                                ✕
                            </button>

                            {/* Full Image */}
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full max-h-[80vh] object-contain rounded-xl bg-white"
                            />
                        </div>
                    </div>
                )
            }
        </>
    );
}
