"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MenuGrid from './MenuGrid';
import PromoBanner from './PromoBanner';

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
    const [items, setItems] = useState(initialItems);

    const [cafeNameState, setCafeNameState] = useState(cafeName);

    // Listen to Real-time Changes
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "menus", cafeId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setItems(data.items || []);
                if (data.name) setCafeNameState(data.name);
            }
        }, (error) => {
            console.error("Realtime update error:", error);
        });
        return () => unsub();
    }, [cafeId]);

    // Sort items: Available first, Sold Out last
    const sortedItems = [...items].sort((a, b) => {
        if (a.isSoldOut === b.isSoldOut) return 0;
        return a.isSoldOut ? 1 : -1;
    });

    // Group by category
    const categories = [...new Set(sortedItems.map(item => item.category))];

    if (items.length === 0) {
        return (
            <main className="p-4 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
                <div className="text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 max-w-md">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold text-yellow-900 mb-2">Menu Kosong</h2>
                    <p className="text-yellow-700">Belum ada item di menu ini.</p>
                    <p className="text-sm text-yellow-600 mt-2">Silakan tambahkan menu melalui dashboard.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8 text-center sm:text-left border-b pb-4">
                <h2 className="text-2xl sm:text-3xl font-bold capitalize text-gray-800 px-2">{cafeNameState}</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Buka 11.00 - 20.00</p>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Senin Tutup</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
                {categories.map(category => (
                    <div key={category}>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 px-1 border-l-4 border-primary pl-3">
                            {category}
                        </h3>
                        <MenuGrid items={sortedItems.filter(i => i.category === category)} />
                    </div>
                ))}
            </div>

            <PromoBanner />
        </main>
    );
}
