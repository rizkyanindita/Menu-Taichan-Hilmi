'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { highlightParts } from '@/lib/menuSearch';

// Requesting a fixed w1000 for every image — including 88px list thumbnails — makes
// old/low-end devices decode far more image data than they ever display. Size per context.
// Some items already have their image field stored as a converted thumbnail URL
// (?id=...&sz=w1000) rather than a share link, so both formats must be matched —
// otherwise the width override is silently ignored for those items.
const convertDriveUrl = (url, width = 1000) => {
    if (!url) return url;
    const shareLinkMatch = url.match(/drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([a-zA-Z0-9_-]+)/);
    const thumbnailMatch = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
    const id = shareLinkMatch?.[1] || thumbnailMatch?.[1];
    if (id) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
    }
    return url;
};

// Descriptions tend to lead with repeated boilerplate ("Disajikan dengan...")
// and bury the actual differentiator in a trailing "(...)" — surface that first.
const splitDescription = (description) => {
    if (!description) return { tag: null, main: "" };
    const match = description.match(/\(([^)]+)\)\s*$/);
    if (!match) return { tag: null, main: description.trim() };
    return {
        tag: match[1].trim(),
        main: description.slice(0, match.index).trim(),
    };
};

// Menyorot kata yang benar-benar diketik pengguna, supaya jelas kenapa sebuah
// item muncul di hasil pencarian.
const Highlight = ({ text, tokens }) => {
    if (!tokens || tokens.length === 0) return text;
    return highlightParts(text, tokens).map((part, i) =>
        part.match ? (
            <mark key={i} className="bg-primary/15 dark:bg-primary/25 text-primary dark:text-orange-300 rounded px-0.5">
                {part.text}
            </mark>
        ) : (
            <span key={i}>{part.text}</span>
        ),
    );
};

// Penanda menu baru sengaja monokrom + satu titik warna merek: cukup menarik
// mata di antara puluhan kartu, tapi tidak beradu dengan foto makanan dan
// tidak berkedip. Ukurannya beda tipis antara grid dan list karena thumbnail
// list cuma 88px.
const NewBadge = ({ compact = false }) => (
    <span
        className={`absolute inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm font-black uppercase text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10
            ${compact
                ? "top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] tracking-[0.1em] gap-0.5"
                : "top-2 left-2 px-2 py-1 text-[9px] tracking-[0.12em]"
            }`}
    >
        <span className={`rounded-full bg-primary ${compact ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
        Baru
    </span>
);

const shimmer =
    "bg-[length:800px_100%] bg-[linear-gradient(90deg,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.08)_37%,rgba(0,0,0,0.04)_63%)] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.09)_37%,rgba(255,255,255,0.04)_63%)] animate-shimmer";

export default function MenuItem({ item, isGrid = true, searchTokens = [] }) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [modalImageLoaded, setModalImageLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const unit = item.unit || null;
    // Item bisa masuk lebih dulu tanpa harga (mis. rilis menu baru yang
    // harganya belum final). "Rp 0" akan terbaca sebagai gratis, jadi harga
    // kosong ditampilkan sebagai label netral.
    const priceNumber = Number(item.price);
    const hasPrice = Number.isFinite(priceNumber) && priceNumber > 0;
    const hasImage = !imageError && item.image && String(item.image).trim() !== "";
    const { tag: descTag, main: descMain } = splitDescription(item.description);

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
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
                style={{ animation: 'fade-in 0.2s ease-out' }}
                onClick={() => setShowModal(false)}
            >
                {/* MODAL CONTAINER */}
                <div
                    className="modal-anim relative flex flex-col bg-white dark:bg-[#141414] rounded-[24px] overflow-hidden shadow-2xl w-full max-w-[420px] sm:max-w-[460px] md:max-w-[520px]"
                    style={{ maxHeight: '90vh' }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    tabIndex="-1"
                >
                    {/* SCROLLABLE BODY — min-h-0 is required so this flex child can actually shrink and scroll instead of pushing content (like the description) out past maxHeight */}
                    <div className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col">

                        {/* Image */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-white/5 shrink-0 overflow-hidden">
                            {hasImage ? (
                                <>
                                    {!modalImageLoaded && (
                                        <div className={`absolute inset-0 rounded-t-[24px] ${shimmer}`} />
                                    )}
                                    <img
                                        src={convertDriveUrl(item.image)}
                                        alt={item.name}
                                        referrerPolicy="no-referrer"
                                        decoding="async"
                                        onLoad={() => setModalImageLoaded(true)}
                                        className={`w-full h-full object-cover rounded-t-[24px] transition-opacity duration-500 ${modalImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-t-[24px]">
                                    <span className="text-4xl opacity-20">🍽️</span>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                aria-label="Tutup"
                                className="absolute top-3 right-3 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-900 dark:text-white font-bold shadow-sm transition-transform active:scale-95 z-10"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                            {/* Title & Price */}
                            <div className="flex flex-col gap-3 mb-6">
                                <h2 id="modal-title" className="text-[24px] sm:text-[28px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                    <Highlight text={item.name} tokens={searchTokens} />
                                </h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    {hasPrice ? (
                                        <span className="inline-flex w-auto rounded-xl bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 text-sm font-bold text-orange-600 dark:text-orange-400">
                                            Rp {priceNumber.toLocaleString("id-ID")}
                                        </span>
                                    ) : (
                                        <span className="inline-flex w-auto rounded-xl bg-gray-100 dark:bg-white/10 px-3 py-1.5 text-sm font-bold text-gray-500 dark:text-gray-400">
                                            Tanya Barista
                                        </span>
                                    )}
                                    {item.isNew && (
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 dark:bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white dark:text-gray-900">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Menu Baru
                                        </span>
                                    )}
                                    {unit && (
                                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg">
                                            Per {unit}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-gray-100 dark:bg-white/10 mb-6 shrink-0" />

                            {/* Description */}
                            {item.description ? (
                                <div className="mb-2">
                                    {descTag && (
                                        <span className="inline-block mb-2 px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-primary/15 text-primary dark:text-orange-400 text-xs font-black uppercase tracking-wide">
                                            {descTag}
                                        </span>
                                    )}
                                    <p className="text-[16px] leading-[1.6] text-gray-600 dark:text-gray-400 break-words">
                                        {descMain}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[16px] leading-[1.6] text-gray-400 dark:text-gray-600 italic break-words mb-2">
                                    Deskripsi belum tersedia.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* STICKY FOOTER BUTTON */}
                    <div
                        className="bg-white dark:bg-[#141414] border-t border-gray-100 dark:border-white/10 shrink-0"
                        style={{ padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full h-[56px] rounded-[16px] bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold text-base transition-transform active:scale-[0.98]"
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
                    /* h-full: kartu harus mengisi tinggi baris grid, kalau tidak
                       kartu berjudul 1 baris berhenti lebih pendek dari tetangganya */
                    className={`relative flex flex-col h-full bg-white dark:bg-white/[0.03] rounded-2xl
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/80 dark:border-white/10
                                group transition-all duration-300 ease-out overflow-hidden
                                ${!item.isSoldOut
                                    ? 'cursor-pointer hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                                    : 'opacity-60 cursor-not-allowed'
                                }`}
                >
                    {/* THUMBNAIL */}
                    <div className="w-full aspect-[4/3] flex-shrink-0 relative bg-gray-50 dark:bg-white/5 overflow-hidden">
                        {hasImage ? (
                            <>
                                {!imageLoaded && (
                                    <div className={`absolute inset-0 ${shimmer}`} />
                                )}
                                <img
                                    src={convertDriveUrl(item.image, 400)}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                    className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10">
                                <span className="text-3xl opacity-20">🍽️</span>
                            </div>
                        )}
                        {item.isNew && !item.isSoldOut && <NewBadge />}
                        {item.isSoldOut && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                    Habis
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                        <div>
                            <h3 className="text-[13px] sm:text-[14px] font-extrabold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                                <Highlight text={item.name} tokens={searchTokens} />
                            </h3>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {hasPrice ? (
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-300">Rp</span>
                                    <span className="text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                        {priceNumber.toLocaleString("id-ID")}
                                    </span>
                                    {unit && (
                                        <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold ml-1">/{unit}</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                                    Tanya Barista
                                </span>
                            )}

                            {!item.isSoldOut ? (
                                <button className="w-full bg-[#34A853] hover:bg-[#2e9649] text-white text-[12px] font-bold py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm">
                                    Detail
                                </button>
                            ) : (
                                <button disabled className="w-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 text-[12px] font-bold py-2 rounded-xl">
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
                    className={`relative flex gap-4 p-4 my-2 bg-white dark:bg-white/[0.03] rounded-[1.4rem]
                                shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/60 dark:border-white/10
                                group transition-all duration-300 ease-out
                                ${!item.isSoldOut
                                    ? 'cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98]'
                                    : 'opacity-55 cursor-not-allowed'
                                }`}
                >
                    {/* THUMBNAIL */}
                    <div className="w-[88px] h-[88px] flex-shrink-0 relative bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden">
                        {hasImage ? (
                            <>
                                {!imageLoaded && (
                                    <div className={`absolute inset-0 ${shimmer}`} />
                                )}
                                <img
                                    src={convertDriveUrl(item.image, 180)}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                    className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10">
                                <span className="text-2xl opacity-20">🍽️</span>
                            </div>
                        )}
                        {item.isNew && !item.isSoldOut && <NewBadge compact />}
                        {item.isSoldOut && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center">
                                <span className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    Habis
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-gray-100 leading-snug mb-0.5 truncate">
                                <Highlight text={item.name} tokens={searchTokens} />
                            </h3>
                            {item.description && (
                                <p className="text-[12px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                                    {descTag && (
                                        <span className="font-bold text-gray-600 dark:text-gray-300">{descTag} · </span>
                                    )}
                                    {descMain}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                            {hasPrice ? (
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-gray-300">Rp</span>
                                    <span className="text-[16px] font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                        {priceNumber.toLocaleString("id-ID")}
                                    </span>
                                    {unit && (
                                        <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold ml-1">/{unit}</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                                    Segera
                                </span>
                            )}
                            {!item.isSoldOut && (
                                <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
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
