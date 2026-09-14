"use client";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { driveImageUrl } from "@/lib/driveImage";
import { getItemVariants, getVariantPriceRange } from "@/lib/variants";

// Objek form kosong. `variants` diisi 2 baris kosong sebagai starting point
// untuk kasus umum (mis. Frozen/Goreng) — boleh ditambah/dikurangi di form.
const createEmptyItem = () => ({
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  isNew: false,
  hasVariants: false,
  variants: [{ label: "", price: "" }, { label: "", price: "" }],
});

export default function MenuManager() {
  const isMenuManagerDisabled = process.env.NEXT_PUBLIC_DISABLE_MENU_MANAGER === "1";

  if (isMenuManagerDisabled) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm border border-gray-100 dark:border-white/10">
          🔒
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Fitur Terkunci</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
          Hubungi admin jika Anda ingin menggunakan fitur Manajemen Menu.
        </p>
      </div>
    );
  }

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneData, setCloneData] = useState({ newId: "", newName: "" });
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const availableCategories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean)),
  );

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Form State
  const [newItem, setNewItem] = useState(createEmptyItem());

  // Uses environment variable for multi-tenancy
  const CAFE_ID = process.env.NEXT_PUBLIC_CAFE_ID || "demo-cafe";
  const CAFE_NAME =
    process.env.NEXT_PUBLIC_CAFE_NAME || "Taichan Goreng Bang BoyS";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            setUserRole(user.role);
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }
    }

    const unsub = onSnapshot(
      doc(db, "menus", CAFE_ID),
      (doc) => {
        if (doc.exists()) {
          setItems(doc.data().items || []);
        } else {
          setItems([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching menu:", error);
        setLoading(false);
        alert("Error connecting to Firebase. Check console.");
      },
    );

    return () => unsub();
  }, []);

  // Bangun field harga eksplisit: item HANYA punya `price` ATAU `variants`,
  // tidak pernah dua-duanya — supaya tidak ada field basi tertinggal saat
  // pengguna pindah mode (polos <-> varian).
  const buildPriceFields = () => {
    if (newItem.hasVariants) {
      const cleanVariants = newItem.variants
        .map((v) => ({ label: v.label.trim(), price: parseFloat(v.price) }))
        .filter((v) => v.label && Number.isFinite(v.price) && v.price > 0);
      return cleanVariants.length > 0 ? { variants: cleanVariants } : null;
    }
    const priceNumber = parseFloat(newItem.price);
    return Number.isFinite(priceNumber) && priceNumber >= 0 ? { price: priceNumber } : null;
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();

    const priceFields = buildPriceFields();
    if (!priceFields) {
      alert(
        newItem.hasVariants
          ? "Isi minimal 1 varian dengan label dan harga yang valid"
          : "Harga tidak valid",
      );
      return;
    }

    const commonFields = {
      name: newItem.name,
      category: newItem.category,
      description: newItem.description,
      image: newItem.image,
      isNew: !!newItem.isNew,
    };

    try {
      const docRef = doc(db, "menus", CAFE_ID);
      const docSnap = await getDoc(docRef);
      const currentItems = docSnap.exists() ? docSnap.data().items || [] : [];

      let updatedItems;

      if (editingItem) {
        // 🔁 EDIT MODE
        updatedItems = currentItems.map((item) =>
          item.id === editingItem.id
            ? {
                id: item.id,
                isSoldOut: !!item.isSoldOut,
                ...commonFields,
                ...priceFields,
              }
            : item,
        );
      } else {
        // ➕ ADD MODE
        const itemToAdd = {
          id: Date.now(),
          isSoldOut: false,
          ...commonFields,
          ...priceFields,
        };

        updatedItems = [...currentItems, itemToAdd];
      }

      await setDoc(
        docRef,
        {
          name: CAFE_NAME,
          items: updatedItems,
        },
        { merge: true },
      );

      // Reset state
      setIsAdding(false);
      setShowNewCategoryInput(false);
      setIsCategoryDropdownOpen(false);
      setEditingItem(null);
      setNewItem(createEmptyItem());
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan menu");
    }
  };

  const handleToggleStock = async (item) => {
    try {
      const docRef = doc(db, "menus", CAFE_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentItems = docSnap.data().items || [];
        // Update just the specific item
        const updatedItems = currentItems.map((i) => {
          if (i.id === item.id) {
            return { ...i, isSoldOut: !i.isSoldOut };
          }
          return i;
        });

        await updateDoc(docRef, {
          items: updatedItems,
        });
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Gagal update status stok");
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Yakin ingin menghapus ${item.name}?`)) return;

    try {
      await updateDoc(doc(db, "menus", CAFE_ID), {
        items: arrayRemove(item),
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Gagal menghapus item");
    }
  };

  const handleCloneMenu = async (e) => {
    e.preventDefault();
    if (!cloneData.newId || !cloneData.newName) {
      alert("ID dan Nama Cafe baru wajib diisi");
      return;
    }

    const newId = cloneData.newId.toLowerCase().replace(/\s+/g, "-");

    try {
      setLoading(true);
      const newDocRef = doc(db, "menus", newId);
      const newDocSnap = await getDoc(newDocRef);

      if (newDocSnap.exists()) {
        if (!confirm(`Cafe ID "${newId}" sudah ada. Timpa datanya?`)) {
          setLoading(false);
          return;
        }
      }

      await setDoc(newDocRef, {
        name: cloneData.newName,
        items: items,
      });

      alert(`Berhasil menduplikasi menu ke ID: ${newId}`);
      setIsCloning(false);
      setCloneData({ newId: "", newName: "" });
    } catch (error) {
      console.error("Error cloning menu:", error);
      alert("Gagal menduplikasi menu");
    } finally {
      setLoading(false);
    }
  };

  const PAGE_SIZE = 6;

  // Tab kategori: "Semua" + tiap kategori yang benar-benar dipakai, masing-masing
  // dengan jumlah item-nya, supaya list panjang kebagi per jenis produk.
  const categoryTabs = [
    { label: "Semua", count: items.length },
    ...availableCategories.map((cat) => ({
      label: cat,
      count: items.filter((item) => item.category === cat).length,
    })),
  ];

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const categoryFilteredItems =
    selectedCategory === "Semua"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  // Filter items by search
  const filteredItems = categoryFilteredItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination hanya relevan kalau kategori/pencarian yang aktif masih
  // menyisakan lebih dari satu halaman — kategori kecil tidak perlu halaman.
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedItems = filteredItems.slice(pageStart, pageStart + PAGE_SIZE);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Memuat menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-gray-100/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="p-5 sm:p-6 border-b border-gray-100/80 dark:border-white/10 rounded-t-3xl overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-orange-100 dark:to-orange-500/10">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">Menu Management</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""} · {CAFE_NAME}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              if (!isAdding) {
                setShowNewCategoryInput(false);
                setIsCategoryDropdownOpen(false);
                setIsCloning(false);
                setEditingItem(null);
                setNewItem(createEmptyItem());
              }
            }}
            disabled={userRole === "staff"}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5
              text-sm font-semibold rounded-xl
              transition-all duration-200 active:scale-[0.97]
              ${userRole === "staff"
                ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : isAdding
                  ? "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg"
                  : "bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-xl hover:shadow-primary/20 shadow-lg"
              }
            `}
          >
            {isAdding ? "✕ Batal" : "+ Tambah Item"}
          </button>
        </div>
      </div>

      {/* ═══════════ TAB KATEGORI + SEARCH (sticky) ═══════════
          Nempel di bawah nav dashboard (h-16 = 64px) saat di-scroll, supaya tidak
          perlu scroll balik ke atas buat ganti kategori/cari di list yang panjang. */}
      {!isAdding && items.length > 0 && (
        <div className="sticky top-16 z-10 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm px-5 sm:px-6 py-3.5 border-b border-gray-100/80 dark:border-white/10">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleSelectCategory(cat.label)}
                className={`inline-flex items-center px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200
                  ${selectedCategory === cat.label
                    ? "bg-gradient-to-r from-primary to-orange-500 text-white border-transparent shadow-md shadow-primary/20"
                    : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl
                         focus:bg-white dark:focus:bg-white/10 focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                         outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      )}

      {/* ═══════════ ADD / EDIT FORM ═══════════ */}
      {isAdding && (
        <div className="p-5 sm:p-6 border-b border-gray-100/80 dark:border-white/10 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-500/[0.06] dark:to-indigo-500/[0.04]">
          <form onSubmit={handleSubmitItem} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{editingItem ? "✏️" : "📝"}</span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {editingItem ? "Edit Menu" : "Tambah Menu Baru"}
              </h3>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Nama Item <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Cappuccino, Nasi Goreng"
                className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>

            {/* Toggle: produk polos vs produk dengan pilihan (varian) */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={!!newItem.hasVariants}
                onChange={(e) => setNewItem({ ...newItem, hasVariants: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">Produk punya pilihan (varian)</span>
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Misal Frozen/Goreng atau Isi 3/Isi 5, masing-masing harga beda
                </span>
              </span>
              <span className="text-lg">🧩</span>
            </label>

            {/* Price + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Harga <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-bold">Rp</span>
                  <input
                    required
                    type="number"
                    placeholder="25000"
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                               focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                               outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Kategori <span className="text-red-400">*</span>
                </label>
                {showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <input
                      required={showNewCategoryInput}
                      type="text"
                      placeholder="Nama kategori baru"
                      className="flex-1 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                                 focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                                 outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewItem({ ...newItem, category: availableCategories[0] || "" });
                      }}
                      className="px-3 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      required={!showNewCategoryInput}
                      value={newItem.category}
                      className="sr-only"
                      onChange={() => {}}
                      tabIndex={-1}
                    />
                    <div
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className={`w-full px-4 py-3 bg-white dark:bg-white/5 border rounded-xl
                                 transition-all duration-200 font-medium text-sm flex justify-between items-center cursor-pointer
                                 ${isCategoryDropdownOpen ? "border-primary/50 ring-2 ring-primary/10" : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}
                    >
                      <span className={`block truncate pr-4 ${newItem.category ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                        {newItem.category || "Pilih Kategori"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 292.4 292.4"
                        className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}>
                        <path d="M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z" />
                      </svg>
                    </div>

                    {isCategoryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)} />
                        <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-[#1c1c1c] border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                          {availableCategories.map((cat) => (
                            <div
                              key={cat}
                              onClick={() => {
                                setNewItem({ ...newItem, category: cat });
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors border-b border-gray-50/80 dark:border-white/5 last:border-0 truncate"
                              title={cat}
                            >
                              {cat}
                            </div>
                          ))}
                          <div
                            onClick={() => {
                              setShowNewCategoryInput(true);
                              setNewItem({ ...newItem, category: "" });
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="px-4 py-2.5 bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100/80 dark:hover:bg-blue-500/20 cursor-pointer text-sm text-blue-600 dark:text-blue-400 font-bold transition-colors sticky bottom-0 border-t border-blue-100/60 dark:border-blue-500/20"
                          >
                            + Tambah Kategori Baru
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Variant rows — muncul hanya kalau toggle "produk dengan pilihan" aktif */}
            {newItem.hasVariants && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Varian &amp; Harga <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {newItem.variants.map((variant, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label, mis. Frozen"
                        className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                                   focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                                   outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                        value={variant.label}
                        onChange={(e) => {
                          const updated = [...newItem.variants];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setNewItem({ ...newItem, variants: updated });
                        }}
                      />
                      <div className="relative w-32 sm:w-36 shrink-0">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-bold">Rp</span>
                        <input
                          type="number"
                          placeholder="25000"
                          className="w-full pl-11 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                                     focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                                     outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                          value={variant.price}
                          onChange={(e) => {
                            const updated = [...newItem.variants];
                            updated[idx] = { ...updated[idx], price: e.target.value };
                            setNewItem({ ...newItem, variants: updated });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newItem.variants.filter((_, i) => i !== idx);
                          setNewItem({
                            ...newItem,
                            variants: updated.length ? updated : [{ label: "", price: "" }],
                          });
                        }}
                        className="px-3 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-500/20 transition-all text-sm font-bold shrink-0"
                        aria-label="Hapus varian"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNewItem({
                      ...newItem,
                      variants: [...newItem.variants, { label: "", price: "" }],
                    })
                  }
                  className="mt-2 text-xs font-bold text-primary hover:underline"
                >
                  + Tambah Varian
                </button>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Deskripsi
              </label>
              <textarea
                rows="2"
                placeholder="Deskripsikan menu Anda..."
                className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium resize-none"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                URL Gambar
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: driveImageUrl(e.target.value, 1000) })}
              />
            </div>

            {/* Tandai menu baru — dipakai untuk badge "Baru" & filter di halaman
                pelanggan. Sengaja manual (bukan otomatis dari tanggal dibuat)
                supaya kamu yang menentukan kapan sorotannya dilepas. */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={!!newItem.isNew}
                onChange={(e) => setNewItem({ ...newItem, isNew: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">Tandai sebagai menu baru</span>
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Muncul badge &ldquo;Baru&rdquo; di kartu menu dan chip filter khusus
                </span>
              </span>
              <span className="text-lg">✨</span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold rounded-xl text-white
                           bg-gradient-to-r from-primary to-orange-500
                           hover:shadow-lg hover:shadow-primary/20
                           transition-all duration-200 active:scale-[0.98]"
              >
                {editingItem ? "💾 Simpan Perubahan" : "💾 Simpan Menu"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setShowNewCategoryInput(false);
                  setIsCategoryDropdownOpen(false);
                  setEditingItem(null);
                  setNewItem(createEmptyItem());
                }}
                className="px-5 py-3 text-sm font-semibold rounded-xl
                           border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════ ITEMS LIST ═══════════ */}
      <div className="p-5 sm:p-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Belum ada menu</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tambahkan item pertama Anda!</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-3">
              {filteredItems.length === 0
                ? "Tidak ada menu yang cocok"
                : `Menampilkan ${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredItems.length)} dari ${filteredItems.length} item${selectedCategory !== "Semua" ? ` di kategori ${selectedCategory}` : ""}`}
            </p>
            <div className="space-y-2.5">
            {filteredItems.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchQuery
                    ? <>Tidak ada menu yang cocok dengan &ldquo;{searchQuery}&rdquo;</>
                    : "Tidak ada menu di kategori ini"}
                </p>
              </div>
            )}
            {pagedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer
                            transition-all duration-200
                            ${item.isSoldOut
                              ? "bg-gray-50/60 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-60"
                              : "bg-white/60 dark:bg-white/[0.03] border-gray-100/80 dark:border-white/10 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                            }`}
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100 dark:bg-white/5 ring-1 ring-gray-200/60 dark:ring-white/10 group-hover:ring-primary/20 transition-all">
                  {item.image && !imageErrors[item.id] && (item.image.startsWith("/") || item.image.startsWith("http")) ? (
                    <Image
                      src={driveImageUrl(item.image, 180)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <span className="text-lg opacity-40">🖼️</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-tight" title={item.name}>
                    {item.name}
                    {item.isNew && !item.isSoldOut && (
                      <span className="ml-1.5 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md align-middle">
                        BARU
                      </span>
                    )}
                    {item.isSoldOut && (
                      <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md align-middle">
                        HABIS
                      </span>
                    )}
                  </p>
                  {item.category && (
                    <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5" title={item.category}>
                      {item.category}
                    </p>
                  )}
                  {(() => {
                    const itemVariants = getItemVariants(item);
                    if (itemVariants.length > 0) {
                      const range = getVariantPriceRange(itemVariants);
                      return (
                        <span className="block text-xs font-bold text-primary mt-1">
                          Mulai Rp {range.min.toLocaleString("id-ID")} · {itemVariants.length} varian
                        </span>
                      );
                    }
                    return (
                      <span className="block text-xs font-bold text-primary mt-1">
                        Rp {Number(item.price || 0).toLocaleString("id-ID")}
                      </span>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Stock toggle */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`h-8 px-2.5 text-[11px] font-bold rounded-lg transition-all duration-200 border
                      ${item.isSoldOut
                        ? "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                      }`}
                    title={item.isSoldOut ? "Klik untuk set Tersedia" : "Klik untuk set Habis"}
                  >
                    {item.isSoldOut ? "🚫" : "✅"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setShowNewCategoryInput(
                        !availableCategories.includes(item.category) && item.category !== "",
                      );
                      setEditingItem(item);
                      const itemVariants = getItemVariants(item);
                      const editingHasVariants = itemVariants.length > 0;
                      setNewItem({
                        name: item.name,
                        price: editingHasVariants ? "" : item.price ?? "",
                        category: item.category,
                        description: item.description || "",
                        image: item.image || "",
                        isNew: !!item.isNew,
                        hasVariants: editingHasVariants,
                        variants: editingHasVariants
                          ? itemVariants.map((v) => ({ label: v.label, price: v.price }))
                          : [{ label: "", price: "" }, { label: "", price: "" }],
                      });
                    }}
                    className="h-8 px-2.5 text-[11px] font-bold text-blue-500 dark:text-blue-400 rounded-lg
                               border border-blue-100 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                  >
                    ✏️
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={userRole === "staff"}
                    className={`h-8 px-2.5 text-[11px] rounded-lg border transition-all
                      ${userRole === "staff"
                        ? "opacity-30 cursor-not-allowed border-transparent text-gray-400 dark:text-gray-600"
                        : "text-gray-400 dark:text-gray-500 border-transparent hover:border-red-100 dark:hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                      }`}
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination — pola kompak "‹ Halaman X dari Y ›" supaya tetap muat
                di layar sempit walau jumlah menu tumbuh jadi ratusan item. */}
            {totalPages > 1 && (
              <div className="mt-5 pt-4 border-t border-gray-100/80 dark:border-white/10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all"
                  aria-label="Halaman sebelumnya"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 min-w-[110px] text-center">
                  Halaman {safePage} dari {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all"
                  aria-label="Halaman berikutnya"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════ DETAIL MODAL ═══════════ */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-[#141414] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full
                         bg-white/90 dark:bg-black/50 backdrop-blur text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-white/10
                         shadow-md hover:bg-gray-100 dark:hover:bg-black/70 active:scale-95 transition-all text-sm"
            >
              ✕
            </button>

            {/* Image */}
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 relative overflow-hidden">
              {selectedItem.image && !imageErrors[selectedItem.id] && (selectedItem.image.startsWith("/") || selectedItem.image.startsWith("http")) ? (
                <Image
                  src={driveImageUrl(selectedItem.image, 800)}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(selectedItem.id)}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-5xl opacity-20">🖼️</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{selectedItem.name}</h3>

              <div className="flex items-center gap-2 mt-2">
                {getItemVariants(selectedItem).length === 0 && (
                  <span className="text-base font-bold text-primary">
                    Rp {Number(selectedItem.price || 0).toLocaleString("id-ID")}
                  </span>
                )}
                {selectedItem.category && (
                  <span className="text-[11px] bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-full text-gray-500 dark:text-gray-400 font-medium">
                    {selectedItem.category}
                  </span>
                )}
              </div>

              {getItemVariants(selectedItem).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {getItemVariants(selectedItem).map((v, i) => (
                    <span
                      key={`${v.label}-${i}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg"
                    >
                      {v.label}
                      <span className="text-primary">Rp {Number(v.price).toLocaleString("id-ID")}</span>
                    </span>
                  ))}
                </div>
              )}

              {selectedItem.description && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {selectedItem.description}
                </p>
              )}

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
