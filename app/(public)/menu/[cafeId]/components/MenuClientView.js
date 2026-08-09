"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import MenuItem from "./MenuItem";
import PromoBanner from "./PromoBanner";
import Skeleton from "./Skeleton";

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

const categoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("bakar")) return "🔥";
  if (n.includes("goreng")) return "🍗";
  if (n.includes("tambah")) return "➕";
  if (n.includes("besar")) return "🍱";
  if (n.includes("katsu") || n.includes("ayam") || n.includes("chicken")) return "🍤";
  if (n.includes("snack")) return "🍟";
  if (n.includes("minum") || n.includes("drink")) return "🥤";
  if (n.includes("paket") || n.includes("hemat")) return "💰";
  if (n.includes("sambal") || n.includes("pocil") || n.includes("sensasi")) return "🌶️";
  return "🍽️";
};

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(
    !initialItems || initialItems.length === 0,
  );
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [scrolled, setScrolled] = useState(false);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

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

  /* ================= SCROLLABILITY HINT ================= */
  // Users often don't realize the category rail scrolls — detect overflow,
  // show edge fades, and nudge once on load so it's discoverable at a glance.

  const updateFade = () => {
    const el = categoryRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  };

  useEffect(() => {
    const el = categoryRef.current;
    if (!el) return;
    updateFade();

    const peek = setTimeout(() => {
      if (el.scrollWidth - el.clientWidth > 10) {
        el.scrollTo({ left: 64, behavior: "smooth" });
        setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 550);
      }
    }, 700);

    window.addEventListener("resize", updateFade);
    return () => {
      clearTimeout(peek);
      window.removeEventListener("resize", updateFade);
    };
  }, [allCategories.length]);

  /* ================= LOADING ================= */

  if (loading) {
    const shimmer =
      "bg-[length:800px_100%] bg-[linear-gradient(90deg,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.08)_37%,rgba(0,0,0,0.04)_63%)] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.09)_37%,rgba(255,255,255,0.04)_63%)] animate-shimmer";
    return (
      <div className="bg-gray-50/50 dark:bg-[#0a0a0a] min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-4">
        <div className={`h-32 rounded-3xl w-full mb-8 shadow-sm ${shimmer}`}></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-28 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${shimmer}`}></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] dark:bg-[#0a0a0a] min-h-screen font-sans selection:bg-orange-100 flex flex-col items-center pb-32 overflow-x-hidden w-full transition-colors duration-300">
      {/* Small admin entry point — unobtrusive, top-left */}
      <Link
        href="/login"
        aria-label="Login admin"
        title="Login admin"
        className="fixed left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 dark:bg-[#1a1a1a]/95 text-gray-500 dark:text-gray-400 hover:text-primary hover:scale-110 active:scale-95 shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-200"
        style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.5rem))" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </Link>

      {/* ================= HERO HEADER ================= */}
      {/* Soft color hint via plain CSS gradient (no blur filter) — blur-3xl was two GPU-composited
          blur passes on every load, one of the biggest perf costs on older/low-end devices. */}
      <header
        className="w-full relative bg-white dark:bg-white/[0.03] pb-10 pt-16 rounded-b-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-10 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 420px 280px at 85% -10%, rgba(255,87,34,0.10), transparent 70%), radial-gradient(ellipse 420px 280px at 5% -10%, rgba(59,130,246,0.08), transparent 70%)",
        }}
      >
        <div className="relative z-10 flex flex-col items-center px-4 animate-fadeIn">
          <div className="mb-5 relative overflow-visible animate-popIn">
            <img
              src={convertDriveUrl(process.env.NEXT_PUBLIC_CAFE_LOGO, 220)}
              alt="Logo Cafe"
              referrerPolicy="no-referrer"
              className="w-[110px] h-[110px] object-contain rounded-[1.5rem] shadow-lg border-4 border-white dark:border-white/10 bg-white"
            />
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-black font-jakarta bg-gradient-to-r from-primary via-orange-500 to-secondary bg-clip-text text-transparent tracking-[-0.03em] leading-[1.1] text-center max-w-md">
            {process.env.NEXT_PUBLIC_CAFE_NAME}
          </h1>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Digital Menu</span>
          </div>
        </div>
      </header>

      {/* ================= 2026 "DYNAMIC ISLAND" CATEGORY NAV ================= */}
      <div className={`sticky top-4 z-10 w-full max-w-2xl px-4 transition-all duration-500 ${scrolled ? 'translate-y-0' : '-translate-y-2'}`}>
        <nav className="w-full bg-white/95 dark:bg-[#141414]/95 border border-gray-200/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.10)] rounded-full overflow-hidden p-1.5 flex items-center gap-1">
          {/* ALL — pinned, always visible */}
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              categoryRef.current?.scrollTo({ left: 0, behavior: "smooth" });
              if (scrolled) window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`h-10 px-4 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0
                        ${selectedCategory === "ALL"
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/30 scale-100"
                          : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 scale-95"
                        }`}
          >
            Semua
          </button>

          {/* Scrollable category rail with edge fades to hint there's more */}
          <div className="relative flex-1 min-w-0">
            {showLeftFade && (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-white dark:from-[#141414] to-transparent" />
            )}
            <div
              ref={categoryRef}
              onScroll={updateFade}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={(e) => {
                    lastClickedRef.current = e.currentTarget;
                    setSelectedCategory(category);
                    if (scrolled) window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`h-10 px-4 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap snap-center flex-shrink-0 capitalize inline-flex items-center gap-1.5
                              ${selectedCategory === category
                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/30 scale-100"
                                : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 scale-95"
                              }`}
                >
                  <span>{categoryIcon(category)}</span>
                  {category}
                </button>
              ))}
            </div>
            {showRightFade && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-white dark:from-[#141414] to-transparent" />
            )}
          </div>

          {/* Layout Toggle Button */}
          <div className="pl-1.5 border-l border-gray-200 dark:border-white/10 flex-shrink-0">
             <button
                onClick={() => setIsGrid(!isGrid)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm border border-gray-100 dark:border-white/10"
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
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl opacity-40">🍽️</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-bold">Menu sedang disiapkan.</p>
          </div>
        ) : (
          displayCategories.map((category, idx) => {
            const itemsInCategory = filteredItems.filter((i) => i.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category} className={`mb-8 ${idx === 0 ? 'mt-2' : ''} animate-fadeIn`}>
                <div className="flex items-center gap-2.5 mb-4 px-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/15 dark:to-secondary/15 text-sm">
                    {categoryIcon(category)}
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 dark:text-gray-100">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent"></div>
                </div>

                <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" : "flex flex-col gap-1"}>
                  {itemsInCategory.map((item, i) => (
                    <div
                      key={item.id}
                      className="animate-slideUp"
                      style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: "backwards" }}
                    >
                      <MenuItem item={item} isGrid={isGrid} />
                    </div>
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
