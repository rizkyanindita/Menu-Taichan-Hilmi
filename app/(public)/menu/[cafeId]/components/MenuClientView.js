"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import MenuItem from "./MenuItem";
import PromoBanner from "./PromoBanner";
import Skeleton from "./Skeleton";

const convertDriveUrl = (url) => {
  if (!url) return url;
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(
    !initialItems || initialItems.length === 0,
  );
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [scrolled, setScrolled] = useState(false);

  const categoryRef = useRef(null);
  const lastClickedRef = useRef(null);

  // Baca parameter layout dari .env sebagai nilai awal (1 = Grid Vertikal, 0 / else = List Kebawah)
  const [isGrid, setIsGrid] = useState(process.env.NEXT_PUBLIC_MENU_LAYOUT === "1");

  // Detect window scroll for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    const docRef = doc(db, "menus", cafeId);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setItems(docSnap.data().items || []);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [cafeId]);

  // Categories appear dynamically based on the original ascending order of items
  const allCategories = [...new Set(items.map((item) => item.category))];
  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const displayCategories =
    selectedCategory === "ALL" ? allCategories : [selectedCategory];

  /* ================= SMART AUTO SCROLL ================= */

  const scrollToCategory = (el) => {
    if (!el || !categoryRef.current) return;
    const container = categoryRef.current;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const relativeLeft = elRect.left - containerRect.left + container.scrollLeft;
    const targetScroll = relativeLeft - container.clientWidth / 2 + elRect.width / 2;
    container.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  useEffect(() => {
    if (!lastClickedRef.current) return;
    requestAnimationFrame(() => scrollToCategory(lastClickedRef.current));
  }, [selectedCategory]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="bg-gray-50/50 min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="h-32 bg-gray-100 rounded-3xl w-full mb-8 animate-pulse shadow-sm"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-white rounded-3xl animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.02)]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans selection:bg-orange-100 flex flex-col items-center pb-32 overflow-x-hidden w-full">
      {/* ================= HERO HEADER ================= */}
      <header className="w-full relative bg-white pb-10 pt-16 rounded-b-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-10 overflow-hidden">
        {/* Soft decorative background gradients — overflow-hidden on header clips them */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center px-4">
          <div className="mb-5 relative overflow-visible">
            <img
              src={convertDriveUrl(process.env.NEXT_PUBLIC_CAFE_LOGO)}
              alt="Logo Cafe"
              referrerPolicy="no-referrer"
              className="w-[110px] h-[110px] object-contain rounded-[1.5rem] shadow-lg border-4 border-white bg-white"
            />
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-black font-jakarta text-gray-900 tracking-[-0.03em] leading-[1.1] text-center max-w-md">
            {process.env.NEXT_PUBLIC_CAFE_NAME}
          </h1>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-gray-100/80 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Digital Menu</span>
          </div>
        </div>
      </header>

      {/* ================= 2026 "DYNAMIC ISLAND" CATEGORY NAV ================= */}
      <div className={`sticky top-4 z-10 w-full max-w-2xl px-4 transition-all duration-500 ${scrolled ? 'translate-y-0' : '-translate-y-2'}`}>
        <nav className="w-full bg-white/95 border border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.10)] rounded-full overflow-hidden p-1.5 flex items-center">
          <div
            ref={categoryRef}
            className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {/* ALL */}
            <button
              onClick={(e) => {
                lastClickedRef.current = e.currentTarget;
                setSelectedCategory("ALL");
                if (scrolled) window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`h-10 px-5 rounded-full text-xs font-bold transition-all whitespace-nowrap snap-center flex-shrink-0
                          ${selectedCategory === "ALL"
                            ? "bg-gray-900 text-white shadow-md scale-100"
                            : "bg-transparent text-gray-500 hover:bg-gray-100 scale-95"
                          }`}
            >
              Semua Menu
            </button>

            {/* Categories */}
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={(e) => {
                  lastClickedRef.current = e.currentTarget;
                  setSelectedCategory(category);
                  if (scrolled) window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`h-10 px-5 rounded-full text-xs font-bold transition-all whitespace-nowrap snap-center flex-shrink-0 capitalize
                            ${selectedCategory === category
                              ? "bg-gray-900 text-white shadow-md scale-100"
                              : "bg-transparent text-gray-500 hover:bg-gray-100 scale-95"
                            }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Layout Toggle Button */}
          <div className="pl-1.5 border-l border-gray-200 flex-shrink-0">
             <button
                onClick={() => setIsGrid(!isGrid)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm border border-gray-100"
                aria-label="Toggle Layout"
                title={isGrid ? "Ubah ke List" : "Ubah ke Kotak"}
             >
                {isGrid ? (
                    // List Icon (Show this when currently in Grid, to switch to List)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                ) : (
                    // Grid Icon (Show this when currently in List, to switch to Grid)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                )}
             </button>
          </div>
        </nav>
      </div>

      {/* ================= MENU CONTENT ================= */}
      <main className="w-full max-w-2xl px-4 mt-8 relative z-0">
        {items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl opacity-40">🍽️</span>
            </div>
            <p className="text-gray-400 text-sm font-bold">Menu sedang disiapkan.</p>
          </div>
        ) : (
          displayCategories.map((category, idx) => {
            const itemsInCategory = filteredItems.filter((i) => i.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category} className={`mb-8 ${idx === 0 ? 'mt-2' : ''} animate-fadeIn`}>
                <div className="flex items-center gap-3 mb-4 px-2">
                  <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" : "flex flex-col gap-1"}>
                  {itemsInCategory.map((item) => (
                    <MenuItem key={item.id} item={item} isGrid={isGrid} />
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
