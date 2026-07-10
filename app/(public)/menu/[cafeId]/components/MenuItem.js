'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const convertDriveUrl = (url) => {
    if (!url) return url;
    const driveRegex = /drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return url;
};

export default function MenuItem({ item, isGrid = true }) {
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const unit = item.unit || null;
    const hasImage = !imageError && item.image && String(item.image).trim() !== "";

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    // Accessibility: Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        if (showModal) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    const modalContent = (
        <>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .modal-anim {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @media (min-width: 640px) {
                    .modal-anim {
                        animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                }
            `}</style>

            {/* OVERLAY BACKDROP */}
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-[6px]"
                style={{ animation: 'fade-in 0.2s ease-out' }}
                onClick={() => setShowModal(false)}
            >
                {/* MODAL CONTAINER */}
                <div
                    className="modal-anim relative flex flex-col bg-white rounded-[24px] overflow-hidden shadow-2xl w-full max-w-[420px] sm:max-w-[460px] md:max-w-[520px]"
                    style={{ maxHeight: '90vh' }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    tabIndex="-1"
                >
                    {/* SCROLLABLE BODY */}
                    <div className="flex-1 overflow-y-auto w-full flex flex-col">
                        
                        {/* Image */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100 shrink-0">
                            {hasImage ? (
                                <img
                                    src={convertDriveUrl(item.image)}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover rounded-t-[24px]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-[24px]">
                                    <span className="text-4xl opacity-20">🍽️</span>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                aria-label="Tutup"
                                className="absolute top-3 right-3 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-900 font-bold shadow-sm transition-transform active:scale-95 z-10"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                            {/* Title & Price */}
                            <div className="flex flex-col gap-3 mb-6">
                                <h2 id="modal-title" className="text-[24px] sm:text-[28px] font-bold text-gray-900 leading-tight">
                                    {item.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex w-auto rounded-xl bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600">
                                        Rp {parseInt(item.price).toLocaleString("id-ID")}
                                    </span>
                                    {unit && (
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            Per {unit}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-gray-100 mb-6 shrink-0" />

                            {/* Description */}
                            <p className="text-[16px] leading-[1.6] text-gray-600 break-words mb-2">
                                {item.description || "Deskripsi belum tersedia."}
                            </p>
                        </div>
                    </div>

                    {/* STICKY FOOTER BUTTON */}
                    <div 
                        className="bg-white border-t border-gray-100 shrink-0"
                        style={{ padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full h-[56px] rounded-[16px] bg-gray-900 text-white font-bold text-base transition-transform active:scale-[0.98]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {isGrid ? (
                /* ═══ MENU ITEM GRID CARD ═══ */
                <div
                    onClick={() => !item.isSoldOut && setShowModal(true)}
                    className={`relative flex flex-col bg-white rounded-2xl
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/80
                                group transition-all duration-300 ease-out overflow-hidden
                                ${!item.isSoldOut
                                    ? 'cursor-pointer hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                                    : 'opacity-60 cursor-not-allowed'
                                }`}
                >
                    {/* THUMBNAIL */}
                    <div className="w-full aspect-[4/3] flex-shrink-0 relative bg-gray-50 overflow-hidden">
                        {hasImage ? (
                            <img
                                src={convertDriveUrl(item.image)}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                loading="lazy"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <span className="text-3xl opacity-20">🍽️</span>
                            </div>
                        )}
                        {item.isSoldOut && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                    Habis
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                        <div>
                            <h3 className="text-[13px] sm:text-[14px] font-extrabold text-gray-900 leading-snug line-clamp-2">
                                {item.name}
                            </h3>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-[11px] font-bold text-gray-800">Rp</span>
                                <span className="text-[14px] sm:text-[15px] font-black text-gray-900 tracking-tight">
                                    {parseInt(item.price).toLocaleString("id-ID")}
                                </span>
                                {unit && (
                                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold ml-1">/{unit}</span>
                                )}
                            </div>
                            
                            {!item.isSoldOut ? (
                                <button className="w-full bg-[#34A853] hover:bg-[#2e9649] text-white text-[12px] font-bold py-2 rounded-xl transition-colors active:scale-95 shadow-sm">
                                    Detail
                                </button>
                            ) : (
                                <button disabled className="w-full bg-gray-100 text-gray-400 text-[12px] font-bold py-2 rounded-xl">
                                    Habis
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* ═══ MENU ITEM LIST CARD ═══ */
                <div
                    onClick={() => !item.isSoldOut && setShowModal(true)}
                    className={`relative flex gap-4 p-4 my-2 bg-white rounded-[1.4rem]
                                shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/60
                                group transition-all duration-300 ease-out
                                ${!item.isSoldOut
                                    ? 'cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98]'
                                    : 'opacity-55 cursor-not-allowed'
                                }`}
                >
                    {/* THUMBNAIL */}
                    <div className="w-[88px] h-[88px] flex-shrink-0 relative bg-gray-50 rounded-2xl overflow-hidden">
                        {hasImage ? (
                            <img
                                src={convertDriveUrl(item.image)}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                loading="lazy"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <span className="text-2xl opacity-20">🍽️</span>
                            </div>
                        )}
                        {item.isSoldOut && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <span className="bg-gray-900 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    Habis
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-[15px] font-extrabold text-gray-900 leading-snug mb-0.5 truncate">
                                {item.name}
                            </h3>
                            {item.description && (
                                <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-[11px] font-bold text-gray-900">Rp</span>
                                <span className="text-[16px] font-black text-gray-900 tracking-tight">
                                    {parseInt(item.price).toLocaleString("id-ID")}
                                </span>
                                {unit && (
                                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold ml-1">/{unit}</span>
                                )}
                            </div>
                            {!item.isSoldOut && (
                                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 group-hover:text-white transition-colors">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {mounted && showModal && createPortal(modalContent, document.body)}
        </>
    );
}
