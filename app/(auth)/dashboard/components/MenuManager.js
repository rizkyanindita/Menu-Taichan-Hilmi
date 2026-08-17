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

const convertDriveUrl = (url) => {
  if (!url) return url;
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    // Using thumbnail API bypasses some embed restrictions and allows compression
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

export default function MenuManager() {
  const isMenuManagerDisabled = process.env.NEXT_PUBLIC_DISABLE_MENU_MANAGER === "1";

  if (isMenuManagerDisabled) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100/80 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm border border-gray-100">
          🔒
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fitur Terkunci</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
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
  const availableCategories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean)),
  );

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Form State
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    isNew: false,
  });

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

  const handleSubmitItem = async (e) => {
    e.preventDefault();

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
                ...item,
                ...newItem,
                price: parseFloat(newItem.price),
              }
            : item,
        );
      } else {
        // ➕ ADD MODE
        const itemToAdd = {
          id: Date.now(),
          ...newItem,
          price: parseFloat(newItem.price),
          isSoldOut: false,
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
      setNewItem({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
        isNew: false,
      });
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

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium text-sm">Memuat menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100/80 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="p-5 sm:p-6 border-b border-gray-100/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-orange-100">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Menu Management</h2>
              <p className="text-xs text-gray-400 mt-0.5">
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
                setNewItem({ name: "", price: "", category: "", description: "", image: "", isNew: false });
              }
            }}
            disabled={userRole === "staff"}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5
              text-sm font-semibold rounded-xl
              transition-all duration-200 active:scale-[0.97]
              ${userRole === "staff"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isAdding
                  ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                  : "bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-xl hover:shadow-primary/20 shadow-lg"
              }
            `}
          >
            {isAdding ? "✕ Batal" : "+ Tambah Item"}
          </button>
        </div>

        {/* Search Bar */}
        {!isAdding && items.length > 0 && (
          <div className="mt-4 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-gray-50/80 border border-gray-200/80 rounded-xl
                         focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                         outline-none transition-all duration-200 placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      {/* ═══════════ ADD / EDIT FORM ═══════════ */}
      {isAdding && (
        <div className="p-5 sm:p-6 border-b border-gray-100/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
          <form onSubmit={handleSubmitItem} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{editingItem ? "✏️" : "📝"}</span>
              <h3 className="text-sm font-bold text-gray-800">
                {editingItem ? "Edit Menu" : "Tambah Menu Baru"}
              </h3>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nama Item <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Cappuccino, Nasi Goreng"
                className="w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 font-medium"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Harga <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Rp</span>
                  <input
                    required
                    type="number"
                    placeholder="25000"
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl
                               focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                               outline-none transition-all duration-200 placeholder:text-gray-400 font-medium"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Kategori <span className="text-red-400">*</span>
                </label>
                {showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <input
                      required={showNewCategoryInput}
                      type="text"
                      placeholder="Nama kategori baru"
                      className="flex-1 px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl
                                 focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                                 outline-none transition-all duration-200 placeholder:text-gray-400 font-medium"
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
                      className="px-3 py-3 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-200 transition-all text-sm font-bold"
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
                      className={`w-full px-4 py-3 bg-white border rounded-xl
                                 transition-all duration-200 font-medium text-sm flex justify-between items-center cursor-pointer
                                 ${isCategoryDropdownOpen ? "border-primary/50 ring-2 ring-primary/10" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <span className={`block truncate pr-4 ${newItem.category ? "text-gray-900" : "text-gray-400"}`}>
                        {newItem.category || "Pilih Kategori"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 292.4 292.4"
                        className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}>
                        <path d="M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z" />
                      </svg>
                    </div>

                    {isCategoryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)} />
                        <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                          {availableCategories.map((cat) => (
                            <div
                              key={cat}
                              onClick={() => {
                                setNewItem({ ...newItem, category: cat });
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors border-b border-gray-50/80 last:border-0 truncate"
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
                            className="px-4 py-2.5 bg-blue-50/80 hover:bg-blue-100/80 cursor-pointer text-sm text-blue-600 font-bold transition-colors sticky bottom-0 border-t border-blue-100/60"
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

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Deskripsi
              </label>
              <textarea
                rows="2"
                placeholder="Deskripsikan menu Anda..."
                className="w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 font-medium resize-none"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                URL Gambar
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                           outline-none transition-all duration-200 placeholder:text-gray-400 font-medium"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: convertDriveUrl(e.target.value) })}
              />
            </div>

            {/* Tandai menu baru — dipakai untuk badge "Baru" & filter di halaman
                pelanggan. Sengaja manual (bukan otomatis dari tanggal dibuat)
                supaya kamu yang menentukan kapan sorotannya dilepas. */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={!!newItem.isNew}
                onChange={(e) => setNewItem({ ...newItem, isNew: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-gray-900">Tandai sebagai menu baru</span>
                <span className="block text-xs text-gray-400 mt-0.5">
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
                  setNewItem({ name: "", price: "", category: "", description: "", image: "", isNew: false });
                }}
                className="px-5 py-3 text-sm font-semibold rounded-xl
                           border border-gray-200 text-gray-500
                           hover:bg-gray-50 transition-all"
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="text-sm font-semibold text-gray-400">Belum ada menu</p>
            <p className="text-xs text-gray-400 mt-1">Tambahkan item pertama Anda!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.length === 0 && searchQuery && (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">Tidak ada menu yang cocok dengan &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer
                            transition-all duration-200
                            ${item.isSoldOut
                              ? "bg-gray-50/60 border-gray-100 opacity-60"
                              : "bg-white/60 border-gray-100/80 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                            }`}
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100 ring-1 ring-gray-200/60 group-hover:ring-primary/20 transition-all">
                  {item.image && !imageErrors[item.id] && (item.image.startsWith("/") || item.image.startsWith("http")) ? (
                    <Image
                      src={convertDriveUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <span className="text-lg opacity-40">🖼️</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate leading-tight" title={item.name}>
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-primary">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                    {item.category && (
                      <span className="text-[10px] text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full truncate max-w-[100px] font-medium" title={item.category}>
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Stock toggle */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`h-8 px-2.5 text-[11px] font-bold rounded-lg transition-all duration-200 border
                      ${item.isSoldOut
                        ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
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
                      setNewItem({
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        description: item.description || "",
                        image: item.image || "",
                        isNew: !!item.isNew,
                      });
                    }}
                    className="h-8 px-2.5 text-[11px] font-bold text-blue-500 rounded-lg
                               border border-blue-100 hover:bg-blue-50 transition-all"
                  >
                    ✏️
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={userRole === "staff"}
                    className={`h-8 px-2.5 text-[11px] rounded-lg border transition-all
                      ${userRole === "staff"
                        ? "opacity-30 cursor-not-allowed border-transparent text-gray-400"
                        : "text-gray-400 border-transparent hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                      }`}
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ DETAIL MODAL ═══════════ */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full
                         bg-white/90 backdrop-blur text-gray-600 border border-gray-200/60
                         shadow-md hover:bg-gray-100 active:scale-95 transition-all text-sm"
            >
              ✕
            </button>

            {/* Image */}
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
              {selectedItem.image && !imageErrors[selectedItem.id] && (selectedItem.image.startsWith("/") || selectedItem.image.startsWith("http")) ? (
                <Image
                  src={convertDriveUrl(selectedItem.image)}
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
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedItem.name}</h3>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-base font-bold text-primary">
                  Rp {selectedItem.price.toLocaleString("id-ID")}
                </span>
                {selectedItem.category && (
                  <span className="text-[11px] bg-gray-100 px-2.5 py-1 rounded-full text-gray-500 font-medium">
                    {selectedItem.category}
                  </span>
                )}
              </div>

              {selectedItem.description && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {selectedItem.description}
                </p>
              )}

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
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
