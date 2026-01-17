'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import MenuItem from './MenuItem';
import PromoBanner from './PromoBanner';
import Skeleton from './Skeleton';

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
    const [items, setItems] = useState(initialItems);
    const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const categoryRef = useRef(null);
    const lastClickedRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Check if scroller can scroll left/right
    const checkScroll = () => {
        if (categoryRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        const container = categoryRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [items]);

    /* ================= FIRESTORE ================= */

    useEffect(() => {
        const docRef = doc(db, "menus", cafeId);
        const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setItems(docSnap.data().items || []);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore error:", error);
            setLoading(false);
        });
        return () => unsub();
    }, [cafeId]);

    const allCategories = [...new Set(items.map(item => item.category))].sort();
    const filteredItems = selectedCategory === "ALL"
        ? items
        : items.filter(item => item.category === selectedCategory);

    const displayCategories = selectedCategory === "ALL"
        ? allCategories
        : [selectedCategory];

    /* ================= SMART AUTO SCROLL ================= */

    const scrollToCategory = (el) => {
        if (!el || !categoryRef.current) return;

        const container = categoryRef.current;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // Get element's position relative to container's content
        const relativeLeft = elRect.left - containerRect.left + container.scrollLeft;

        // Center the element
        const targetScroll = relativeLeft - (container.clientWidth / 2) + (elRect.width / 2);

        container.scrollTo({
            left: targetScroll,
            behavior: "smooth"
        });
    };

    // Jalankan scroll setelah React render selesai
    useEffect(() => {
        if (!lastClickedRef.current) return;

        requestAnimationFrame(() => {
            scrollToCategory(lastClickedRef.current);
        });
    }, [selectedCategory]);

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <div className="bg-white min-h-screen p-4 space-y-4 max-w-md mx-auto">
                <div className="h-8 bg-gray-100 rounded-lg w-1/2 mx-auto mb-8 animate-pulse"></div>
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-orange-100 flex flex-col items-center">

            {/* ================= HEADER ================= */}
            <header className="w-full pt-12 pb-8 text-center bg-white">
                <div className="flex justify-center mb-6">
                    <img
                        src="https://cdn.dribbble.com/userupload/32946607/file/original-27b2a5a894781ab28d39568a2a9e9463.jpg?resize=752x&vertical=center"
                        alt="Logo Cafe"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-full shadow-md"

                    />

                </div>
                <h1 className="
                    text-xl sm:text-2xl
                    font-black uppercase tracking-wide sm:tracking-widest
                    text-gray-900 px-4
                    leading-tight
                    break-words
                ">
                    {cafeName}
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] mt-1 pr-[0.4em]">
                    Digital Menu Card
                </p>
            </header>

            {/* ================= CATEGORY NAV ================= */}
            <nav className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-5">

                    {/* Title */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                            Kategori
                        </span>
                    </div>

                    {/* ROW */}
                    {/* ROW - Wrapped in relative for absolute arrows */}
                    <div className="relative flex items-center">

                        {/* LEFT ARROW - Dynamic visibility */}
                        <button
                            onClick={() => categoryRef.current.scrollBy({ left: -200, behavior: "smooth" })}
                            className={`absolute left-0 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full 
                                       bg-white/90 backdrop-blur-sm border shadow-md hover:bg-gray-100 transition-all duration-300 active:scale-95
                                       ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        {/* CATEGORY SCROLLER */}
                        <div
                            ref={categoryRef}
                            className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x py-2 px-10 md:px-12"
                        >
                            {/* ALL */}
                            <button
                                onClick={(e) => {
                                    lastClickedRef.current = e.currentTarget;
                                    setSelectedCategory("ALL");
                                }}
                                className={`h-10 px-6 rounded-full text-xs font-bold transition-all border whitespace-nowrap
                                    ${selectedCategory === "ALL"
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                    }`}
                            >
                                Semua
                            </button>

                            {/* Categories */}
                            {allCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={(e) => {
                                        lastClickedRef.current = e.currentTarget;
                                        setSelectedCategory(category);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`h-10 px-6 rounded-full text-xs font-bold transition-all border whitespace-nowrap uppercase
                                        ${selectedCategory === category
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* RIGHT ARROW - Dynamic visibility */}
                        <button
                            onClick={() => categoryRef.current.scrollBy({ left: 200, behavior: "smooth" })}
                            className={`absolute right-0 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full 
                                       bg-white/90 backdrop-blur-sm border shadow-md hover:bg-gray-100 transition-all duration-300 active:scale-95
                                       ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>

                    </div>
                </div>
            </nav>

            {/* ================= MENU CONTENT ================= */}
            <main className="w-full max-w-2xl px-5 py-2 pb-32">
                {items.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="text-4xl mb-4 opacity-20">🍽️</div>
                        <p className="text-gray-400 text-sm font-medium">Menu belum tersedia.</p>
                    </div>
                ) : (
                    displayCategories.map((category) => {
                        const itemsInCategory = filteredItems.filter(i => i.category === category);
                        if (itemsInCategory.length === 0) return null;

                        return (
                            <section key={category} className="mt-8 mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 whitespace-nowrap">
                                        {category}
                                    </h2>
                                    <div className="flex-1 h-[2px] bg-orange-50"></div>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {itemsInCategory
                                        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                                        .map((item) => (
                                            <MenuItem key={item.id} item={item} />
                                        ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </main>

            <PromoBanner />
        </div>
    );
}
