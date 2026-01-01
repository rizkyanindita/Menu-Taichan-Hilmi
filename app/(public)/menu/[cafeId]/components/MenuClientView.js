'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import MenuItem from './MenuItem';
import PromoBanner from './PromoBanner';
import Skeleton from './Skeleton';

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
    const [items, setItems] = useState(initialItems);
    const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);
    const [selectedCategory, setSelectedCategory] = useState("ALL");

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
            {/* BRAND HEADER */}
            <header className="w-full pt-10 pb-6 text-center bg-white">
                <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900 px-4">
                    {cafeName}
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] mt-1 pr-[0.4em]">
                    Digital Menu Card
                </p>
            </header>

            {/* UPGRADED CATEGORY NAV - High affordance for scrolling */}
            <nav className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 flex justify-center">
                <div className="relative w-full max-w-2xl">

                    {/* Visual Hint: Scroll Indicator Arrows/Icons */}
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 pointer-events-none md:hidden text-gray-300 animate-pulse">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </div>

                    <div className="flex items-center gap-2 p-4 px-6 overflow-x-auto no-scrollbar scroll-smooth">
                        <button
                            onClick={() => setSelectedCategory("ALL")}
                            className={`min-h-[38px] px-6 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap
                                ${selectedCategory === "ALL"
                                    ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200 ring-2 ring-orange-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                                }`}
                        >
                            SEMUA MENU
                        </button>
                        {allCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`min-h-[38px] px-6 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap uppercase
                                    ${selectedCategory === category
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200 ring-2 ring-orange-100'
                                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                        <div className="min-w-[40px] h-1 shrink-0"></div>
                    </div>

                    {/* Right Gradient & Hint */}
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/40 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1 text-gray-300 animate-pulse md:hidden">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </div>
                </div>
            </nav>

            {/* MENU CONTENT */}
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
