'use client';

import { useState } from 'react';

export default function MenuItem({ item }) {
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const unit = item.unit || null;

    return (
        <>
            {/* MENU ITEM CARD */}
            <div
                onClick={() => !item.isSoldOut && setShowModal(true)}
                className={`flex items-center gap-4 py-5 border-b border-gray-50 last:border-0 group animate-in fade-in duration-500 transition-all active:scale-[0.98] ${!item.isSoldOut ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
            >
                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col mb-1">
                        <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-0.5">
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-orange-600">
                                Rp {parseInt(item.price).toLocaleString("id-ID")}
                            </span>
                            {unit && (
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 rounded">
                                    {unit}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pr-2">
                        {item.description}
                    </p>
                </div>

                {/* THUMBNAIL */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
                    {(!imageError && item.image && String(item.image).trim() !== "") ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center p-2 leading-tight font-bold bg-gray-100/50 uppercase">
                            Gambar belum tersedia
                        </div>
                    )}

                    {item.isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                            <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* RESPONSIVE DETAIL MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Image - Responsive Aspect Ratio */}
                        <div className="relative w-full aspect-[4/3] bg-gray-100">
                            {(!imageError && item.image && String(item.image).trim() !== "") ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-b border-gray-100">
                                    <div className="text-4xl mb-2 opacity-20">🖼️</div>
                                    <span className="text-[10px] uppercase font-black tracking-widest">Gambar belum tersedia</span>
                                </div>
                            )}
                            {/* Close Button Inside Modal */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur text-white flex items-center justify-center rounded-full text-xs font-bold hover:bg-black transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex flex-col items-center text-center">
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2">
                                {item.name}
                            </h2>

                            {unit && (
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    {unit}
                                </div>
                            )}

                            {/* PRICE - Adjusted to be proportional and readable */}
                            <div className="text-lg sm:text-xl font-black text-orange-600 mb-6 bg-orange-50 px-5 py-2 rounded-xl">
                                Rp {parseInt(item.price).toLocaleString("id-ID")}
                            </div>

                            <div className="w-12 h-0.5 bg-gray-100 mb-6 rounded-full"></div>

                            <div className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium mb-8">
                                {item.description}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black tracking-[0.2em] text-xs active:scale-95 transition-all shadow-xl shadow-gray-200 uppercase"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
