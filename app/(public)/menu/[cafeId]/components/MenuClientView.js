"use client";

import { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { searchMenuItems, tokenize } from "@/lib/menuSearch";
import NextImage from "next/image";
import MenuItem from "./MenuItem";
import { driveImageUrl } from "@/lib/driveImage";
import PromoBanner from "./PromoBanner";


const categoryIcon = (name = "") => {
  const n = name.toLowerCase();
  // Minuman dicek paling awal: kategori seperti "Minuman Dingin" harus tetap
  // dapat 🥤 walau kata lain di bawah ikut cocok.
  if (n.includes("kopi") || n.includes("coffee")) return "☕";
  if (n.includes("minum") || n.includes("drink") || n.includes("beverage")) return "🥤";
  if (n.includes("bakar")) return "🔥";
  if (n.includes("goreng")) return "🍗";
  if (n.includes("tambah")) return "➕";
  if (n.includes("besar")) return "🍱";
  if (n.includes("katsu") || n.includes("ayam") || n.includes("chicken")) return "🍤";
  if (n.includes("snack")) return "🍟";
  if (n.includes("paket") || n.includes("hemat")) return "💰";
  if (n.includes("sambal") || n.includes("pocil") || n.includes("sensasi")) return "🌶️";
  return "🍽️";
};

/* Jumlah kategori yang langsung ditampilkan. Sisanya disembunyikan di balik
   "+N lainnya" supaya blok kategori tidak pernah lebih dari ~2 baris. */
const VISIBLE_CATEGORIES = 7;

// Slot yang terlihat itu terbatas, jadi isinya diprioritaskan:
// minuman selalu dapat slot (kategori yang paling sering dicari sendiri),
// sedangkan kategori pelengkap ("Tambahan", topping, extra) didorong ke
// overflow — orang jarang membuka menu untuk mencari itu duluan.
const PINNED_CATEGORY = /minum|drink|beverage|kopi|coffee/;
const DEMOTED_CATEGORY = /tambah|extra|topping|add\s?on|pelengkap/;

const SearchIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GridIcon = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ListIcon = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// Sebelumnya satu tombol dengan SATU ikon yang berganti makna (menampilkan
// tampilan TUJUAN, bukan tampilan aktif) — pengguna harus menerka dulu, dan
// title="..." (tooltip hover) sama sekali tidak berguna di layar sentuh, yang
// notabene 100% traffic menu QR ini. Grid/list adalah salah satu dari sedikit
// kasus di mana ikon-tanpa-teks aman dipakai — TAPI hanya kalau kedua opsi
// ditampilkan sekaligus dalam satu segmented control dengan status aktif yang
// jelas, bukan satu ikon yang berganti-ganti. (ref: NN/G icon usability —
// hindari label hover-only; pola grid/list toggle umum di Drive/Airbnb/Trello.)
// withLabel: dua ikon berdampingan ternyata masih tidak cukup untuk pengguna
// yang benar-benar belum pernah melihat ikon grid/list — feedback lapangan dari
// pelanggan awam. Sesuai prinsip yang sama (NN/G: ikon butuh teks kecuali
// maknanya universal), begitu terbukti TIDAK universal untuk audiens ini,
// solusinya adalah teks, bukan ikon yang lebih besar. Dipasang hanya di
// kemunculan PERTAMA (header dekat "KATEGORI", sebelum pengguna sempat
// scroll) supaya pola belajarnya benar: lihat kata "Kotak"/"List" sekali di
// sana, lalu ikon-saja di bar sticky (setelah scroll) tinggal mengingatkan.
const LayoutToggle = ({ isGrid, onToggle, className = "", withLabel = false }) => {
  const activeCls = "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm";
  const inactiveCls = "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";
  const segmentCls = withLabel ? "px-3 gap-1.5" : "flex-1";
  return (
    <div
      role="group"
      aria-label="Tampilan menu"
      className={`inline-flex items-center gap-0.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => !isGrid && onToggle()}
        aria-pressed={isGrid}
        aria-label="Tampilan kotak"
        className={`h-full flex items-center justify-center rounded-lg transition-colors ${segmentCls} ${isGrid ? activeCls : inactiveCls}`}
      >
        <GridIcon />
        {withLabel && <span className="text-[12px] font-bold">Kotak</span>}
      </button>
      <button
        type="button"
        onClick={() => isGrid && onToggle()}
        aria-pressed={!isGrid}
        aria-label="Tampilan list"
        className={`h-full flex items-center justify-center rounded-lg transition-colors ${segmentCls} ${!isGrid ? activeCls : inactiveCls}`}
      >
        <ListIcon />
        {withLabel && <span className="text-[12px] font-bold">List</span>}
      </button>
    </div>
  );
};

/* Chip kategori dipakai di dua tempat (blok utama & bottom sheet) — satu
   komponen supaya state aktif/hitungannya tidak pernah beda tampilan. */
const CategoryChip = ({ label, icon, count, active, onClick, full = false }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`h-10 px-3.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5 border transition-all duration-200 active:scale-95
      ${full ? "w-full justify-start" : ""}
      ${active
        ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-md shadow-primary/25"
        : "bg-white dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 border-gray-200/70 dark:border-white/10 hover:border-primary/40 hover:text-gray-900 dark:hover:text-white"
      }`}
  >
    <span className="text-[15px] leading-none">{icon}</span>
    <span className="capitalize truncate">{label}</span>
    <span
      className={`text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md ${full ? "ml-auto" : ""}
        ${active ? "bg-white/25 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"}`}
    >
      {count}
    </span>
  </button>
);

export default function MenuClientView({ initialItems, cafeId, cafeName }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(
    !initialItems || initialItems.length === 0,
  );
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [expandCategories, setExpandCategories] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const heroSearchRef = useRef(null);
  const stickySearchRef = useRef(null);
  const mainRef = useRef(null);

  // Default tampilan kotak. .env hanya dipakai untuk menurunkannya ke list
  // (NEXT_PUBLIC_MENU_LAYOUT=0); nilai lain / tidak diset tetap kotak.
  const [isGrid, setIsGrid] = useState(process.env.NEXT_PUBLIC_MENU_LAYOUT !== "0");

  useEffect(() => { setMounted(true); }, []);

  // Bar ringkas baru muncul setelah hero (beserta search field-nya) tergulung
  // ke atas — sebelum itu, dua search field di layar cuma bikin bingung.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 260);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  /* ================= SEARCH ================= */
  // useDeferredValue: ketikan tetap responsif di HP kentang — React boleh
  // menunda render ulang daftar tanpa menahan input.
  const deferredQuery = useDeferredValue(query);
  const searchTokens = useMemo(() => tokenize(deferredQuery), [deferredQuery]);
  const isSearching = searchTokens.length > 0;
  const searchResults = useMemo(
    () => (isSearching ? searchMenuItems(items, deferredQuery) : []),
    [items, deferredQuery, isSearching],
  );

  const handleQueryChange = (value) => {
    setQuery(value);
    // Pencarian selalu lintas kategori; kalau tidak, item yang jelas cocok bisa
    // "hilang" hanya karena filter kategori masih aktif dari klik sebelumnya.
    if (value.trim() && selectedCategory !== "ALL") setSelectedCategory("ALL");
  };

  const clearQuery = () => {
    setQuery("");
    (scrolled ? stickySearchRef : heroSearchRef).current?.focus();
  };

  const searchKeyDown = (e) => {
    // Escape mengosongkan, Enter menutup keyboard HP — hasil sudah tampil live
    // jadi tidak ada yang perlu di-"submit".
    if (e.key === "Escape") clearQuery();
    if (e.key === "Enter") e.currentTarget.blur();
  };

  /* ================= CATEGORIES ================= */

  const allCategories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items],
  );
  // Rilis baru dapat satu chip sendiri di depan — pengganti banner promo yang
  // biasanya menutupi menu. Chip-nya hilang sendiri begitu tidak ada item baru.
  const newItems = useMemo(() => items.filter((item) => item.isNew), [items]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }
    return counts;
  }, [items]);

  // Urutan chip: urutan asli menu dipertahankan, kecuali kategori pelengkap
  // yang digeser ke belakang dan minuman yang ditarik masuk ke slot terlihat.
  const orderedCategories = useMemo(() => {
    const ordered = [...allCategories].sort(
      (a, b) => Number(DEMOTED_CATEGORY.test(a.toLowerCase())) - Number(DEMOTED_CATEGORY.test(b.toLowerCase())),
    );
    const drinkIndex = ordered.findIndex((c) => PINNED_CATEGORY.test(c.toLowerCase()));
    if (drinkIndex >= VISIBLE_CATEGORIES) {
      const [drink] = ordered.splice(drinkIndex, 1);
      ordered.splice(VISIBLE_CATEGORIES - 1, 0, drink);
    }
    return ordered;
  }, [allCategories]);

  const hiddenCount = Math.max(orderedCategories.length - VISIBLE_CATEGORIES, 0);
  const visibleCategories =
    expandCategories || hiddenCount === 0
      ? orderedCategories
      : orderedCategories.slice(0, VISIBLE_CATEGORIES);

  const pickCategory = (category) => {
    setSelectedCategory(category);
    setQuery("");
    setSheetOpen(false);
    // Kalau pilihan dibuat dari tengah halaman, lompat ke awal daftar —
    // tanpa ini pengguna melihat layar kosong di bawah kategori yang pendek.
    const listTop = Math.max((mainRef.current?.offsetTop || 0) - 76, 0);
    if (window.scrollY > listTop) window.scrollTo({ top: listTop, behavior: "smooth" });
  };

  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((item) => item.category === selectedCategory);
  const displayCategories =
    selectedCategory === "ALL" ? allCategories : [selectedCategory];

  /* ================= CATEGORY SHEET ================= */

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => { if (e.key === "Escape") setSheetOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen]);

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

  // Anggaran "eager" harus dihitung lintas-section. renderItems dipanggil sekali
  // per kategori, jadi indeks lokal `i` selalu mulai dari 0 lagi: memakainya apa
  // adanya membuat SETIAP kategori menyumbang 6 gambar eager — terukur 45
  // <link rel="preload"> sekaligus di HTML, yang justru memperlambat karena
  // semuanya berebut bandwidth dengan gambar yang benar-benar terlihat.
  const eagerBudget = isGrid ? 6 : 4;
  let eagerUsed = 0;
  const takeEager = () => (eagerUsed < eagerBudget ? (eagerUsed++, true) : false);

  const renderItems = (list) => (
    <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" : "flex flex-col gap-1"}>
      {list.map((item, i) => (
        <div
          key={item.id}
          className="animate-slideUp h-full"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: "backwards" }}
        >
          <MenuItem item={item} isGrid={isGrid} searchTokens={searchTokens} priority={takeEager()} />
        </div>
      ))}
    </div>
  );

  const categorySheet = (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => setSheetOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pilih kategori"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-[#141414] rounded-t-[28px] sm:rounded-[28px] shadow-2xl animate-slideUp flex flex-col max-h-[80vh]"
      >
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <span className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-white/15" />
        </div>
        <div className="px-5 pt-3 pb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-black text-gray-900 dark:text-gray-100">Pilih Kategori</h2>
          <button
            onClick={() => setSheetOpen(false)}
            aria-label="Tutup"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 active:scale-90 transition-transform"
          >
            <CloseIcon />
          </button>
        </div>
        <div
          className="px-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          <CategoryChip
            full
            label="Semua Menu"
            icon="🍽️"
            count={items.length}
            active={selectedCategory === "ALL"}
            onClick={() => pickCategory("ALL")}
          />
          {newItems.length > 0 && (
            <CategoryChip
              full
              label="Menu Baru"
              icon="✨"
              count={newItems.length}
              active={selectedCategory === "NEW"}
              onClick={() => pickCategory("NEW")}
            />
          )}
          {orderedCategories.map((category) => (
            <CategoryChip
              key={category}
              full
              label={category}
              icon={categoryIcon(category)}
              count={categoryCounts.get(category) || 0}
              active={selectedCategory === category}
              onClick={() => pickCategory(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] dark:bg-[#0a0a0a] min-h-screen font-sans selection:bg-orange-100 flex flex-col items-center pb-32 overflow-x-hidden w-full transition-colors duration-300">
      {/* Small admin entry point — disembunyikan saat bar ringkas turun supaya
          keduanya tidak bertabrakan di pojok yang sama */}
      <Link
        href="/login"
        aria-label="Login admin"
        title="Login admin"
        className={`fixed left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 dark:bg-[#1a1a1a]/95 text-gray-500 dark:text-gray-400 hover:text-primary hover:scale-110 active:scale-95 shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-300 ${scrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100"}`}
        style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.5rem))" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </Link>

      {/* ================= BAR RINGKAS (muncul setelah hero lewat) ================= */}
      {/* Satu baris saja: cari + kategori + layout. Tidak ada rail yang perlu
          digeser, dan tinggi sticky-nya tetap ~64px. */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="bg-white/85 dark:bg-[#0f0f0f]/85 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
          {/* pr-16, bukan pr-4: ThemeToggle mengambang fixed di pojok kanan atas
              (right-4, z-50) dan bar ini juga fixed top-0 (z-40) — begitu keduanya
              tampil bersamaan saat scroll, item paling kanan di baris ini akan
              tertutup separuh oleh pil tema kecuali diberi ruang aman selebar itu. */}
          <div className="max-w-2xl mx-auto pl-4 pr-16 py-2.5 flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <SearchIcon width="16" height="16" />
              </span>
              <input
                ref={stickySearchRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={searchKeyDown}
                /* Baris ini berbagi ruang dengan pil Kategori + toggle tampilan + jarak aman
                   ThemeToggle yang mengambang di pojok — placeholder pendek karena ikon kaca
                   pembesar sudah menjelaskan konteksnya, sementara "Cari menu…" kepotong jadi
                   satu huruf saja di lebar layar seperti ini. */
                placeholder="Cari…"
                aria-label="Cari menu"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                tabIndex={scrolled ? 0 : -1}
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-gray-100/80 dark:bg-white/[0.06] border border-transparent focus:border-primary/40 focus:bg-white dark:focus:bg-white/[0.09] text-[14px] font-semibold text-gray-800 dark:text-gray-100 placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200"
              />
              {query && (
                <button
                  onClick={clearQuery}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-gray-400 active:scale-90 transition-transform"
                >
                  <CloseIcon width="12" height="12" />
                </button>
              )}
            </div>

            <button
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className={`h-11 max-w-[42%] px-3 rounded-xl inline-flex items-center gap-1.5 text-[13px] font-bold border transition-colors shrink-0
                ${selectedCategory === "ALL"
                  ? "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200/70 dark:border-white/10"
                  : "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-md shadow-primary/25"
                }`}
            >
              <span className="text-[15px] leading-none">
                {selectedCategory === "ALL" ? "🍽️" : selectedCategory === "NEW" ? "✨" : categoryIcon(selectedCategory)}
              </span>
              <span className="capitalize truncate">
                {selectedCategory === "ALL" ? "Kategori" : selectedCategory === "NEW" ? "Baru" : selectedCategory}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <LayoutToggle isGrid={isGrid} onToggle={() => setIsGrid(!isGrid)} className="h-11 w-[68px] shrink-0" />
          </div>
        </div>
      </div>

      {/* ================= HERO HEADER ================= */}
      {/* Soft color hint via plain CSS gradient (no blur filter) — blur-3xl was two GPU-composited
          blur passes on every load, one of the biggest perf costs on older/low-end devices. */}
      <header
        className="w-full relative bg-white dark:bg-white/[0.03] pb-12 pt-16 rounded-b-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-10 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 420px 280px at 85% -10%, rgba(255,87,34,0.10), transparent 70%), radial-gradient(ellipse 420px 280px at 5% -10%, rgba(59,130,246,0.08), transparent 70%)",
        }}
      >
        <div className="relative z-10 flex flex-col items-center px-4 animate-fadeIn">
          <div className="mb-5 relative overflow-visible animate-popIn">
            <NextImage
              src={driveImageUrl(process.env.NEXT_PUBLIC_CAFE_LOGO, 220)}
              alt="Logo Cafe"
              width={110}
              height={110}
              sizes="110px"
              /* Logo adalah LCP candidate di atas lipatan: jangan pernah lazy. */
              priority
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

          {/* SEARCH FIELD UTAMA — target pertama setelah nama kafe, ukuran penuh
              dan tidak berebut ruang dengan filter kategori. */}
          <div className="relative w-full max-w-md mt-7">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <SearchIcon />
            </span>
            <input
              ref={heroSearchRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={searchKeyDown}
              placeholder="Cari menu, kategori, atau harga…"
              aria-label="Cari menu"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full h-[52px] pl-12 pr-12 rounded-2xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 text-[15px] font-semibold text-gray-800 dark:text-gray-100 placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:bg-white dark:focus:bg-white/[0.09] focus:border-primary/40 focus:ring-4 focus:ring-primary/10 focus:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-200"
            />
            {query && (
              <button
                onClick={clearQuery}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-300/80 dark:hover:bg-white/20 active:scale-90 transition-all"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= FILTER KATEGORI (WRAP, TANPA GESER) ================= */}
      {allCategories.length > 0 && (
        <div className="w-full max-w-2xl px-4 mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Kategori
            </h2>
            <LayoutToggle isGrid={isGrid} onToggle={() => setIsGrid(!isGrid)} withLabel className="h-9 w-auto" />
          </div>

          <div className="flex flex-wrap gap-2">
            <CategoryChip
              label="Semua"
              icon="🍽️"
              count={items.length}
              active={selectedCategory === "ALL"}
              onClick={() => pickCategory("ALL")}
            />
            {newItems.length > 0 && (
              <CategoryChip
                label="Baru"
                icon="✨"
                count={newItems.length}
                active={selectedCategory === "NEW"}
                onClick={() => pickCategory("NEW")}
              />
            )}
            {visibleCategories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                icon={categoryIcon(category)}
                count={categoryCounts.get(category) || 0}
                active={selectedCategory === category}
                onClick={() => pickCategory(category)}
              />
            ))}

            {hiddenCount > 0 && (
              <button
                onClick={() => setExpandCategories((v) => !v)}
                className="h-10 px-3.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5 border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors active:scale-95"
              >
                {expandCategories ? "Lebih sedikit" : `+${hiddenCount} lainnya`}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${expandCategories ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= MENU CONTENT ================= */}
      <main ref={mainRef} className="w-full max-w-2xl px-4 mt-7 relative z-0">
        {items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl opacity-40">🍽️</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-bold">Menu sedang disiapkan.</p>
          </div>
        ) : isSearching ? (
          /* ================= HASIL PENCARIAN ================= */
          /* Hasil sengaja tidak dikelompokkan per kategori: urutan relevansi
             lebih berguna daripada urutan menu saat pengguna sedang mencari. */
          searchResults.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center animate-fadeIn">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl opacity-40">🔍</span>
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-sm font-bold mb-1">
                Tidak ada menu untuk “{query.trim()}”
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-[13px] font-medium mb-5 max-w-xs">
                Coba kata kunci lain, misalnya nama menu, kategori, atau kisaran harga.
              </p>
              <button
                onClick={clearQuery}
                className="h-10 px-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md shadow-primary/30 active:scale-95 transition-transform"
              >
                Hapus pencarian
              </button>
            </div>
          ) : (
            <section className="mb-8 animate-fadeIn">
              <div className="flex items-center gap-2.5 mb-4 px-2">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/15 dark:to-secondary/15 text-sm">
                  🔍
                </span>
                <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 dark:text-gray-100">
                  {searchResults.length} Hasil
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent"></div>
              </div>
              {renderItems(searchResults)}
            </section>
          )
        ) : selectedCategory === "NEW" ? (
          <section className="mb-8 animate-fadeIn">
            <div className="flex items-center gap-2.5 mb-4 px-2">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/15 dark:to-secondary/15 text-sm">
                ✨
              </span>
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 dark:text-gray-100">
                Menu Baru
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent"></div>
            </div>
            {renderItems(newItems)}
          </section>
        ) : (
          displayCategories.map((category) => {
            const itemsInCategory = filteredItems.filter((i) => i.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category} className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-2.5 mb-4 px-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/15 dark:to-secondary/15 text-sm">
                    {categoryIcon(category)}
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 dark:text-gray-100">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent"></div>
                </div>
                {renderItems(itemsInCategory)}
              </section>
            );
          })
        )}
      </main>

      <PromoBanner />

      {mounted && sheetOpen && createPortal(categorySheet, document.body)}
    </div>
  );
}
