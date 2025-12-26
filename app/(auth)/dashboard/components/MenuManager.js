"use client";
import { useState, useEffect } from 'react';
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";

export default function MenuManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        image: ''
    });

    // Hardcoded for demo purposes
    const CAFE_ID = "demo-cafe";

    useEffect(() => {
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
            }
        );

        return () => unsub();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const itemToAdd = {
                id: Date.now(),
                ...newItem,
                price: parseFloat(newItem.price),
                isSoldOut: false
            };

            const docRef = doc(db, "menus", CAFE_ID);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: "Taichan Goreng Bang Boy",
                    items: [itemToAdd]
                });
            } else {
                await updateDoc(docRef, {
                    items: arrayUnion(itemToAdd)
                });
            }

            setIsAdding(false);
            setNewItem({
                name: '',
                price: '',
                category: '',
                description: '',
                image: ''
            });
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item: " + error.message);
        }
    };

    const handleToggleStock = async (item) => {
        try {
            const docRef = doc(db, "menus", CAFE_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const currentItems = docSnap.data().items || [];
                // Update just the specific item 
                const updatedItems = currentItems.map(i => {
                    if (i.id === item.id) {
                        return { ...i, isSoldOut: !i.isSoldOut };
                    }
                    return i;
                });

                await updateDoc(docRef, {
                    items: updatedItems
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
                items: arrayRemove(item)
            });
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Gagal menghapus item");
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">Loading menu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola menu cafe Anda</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-full sm:w-auto text-sm py-2.5 px-5 shadow-lg hover:shadow-xl justify-center"
                >
                    {isAdding ? '✕ Batal' : '+ Tambah Item'}
                </Button>
            </div>

            {/* Add Item Form */}
            {isAdding && (
                <form onSubmit={handleAddItem} className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-inner">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span> Tambah Menu Baru
                    </h3>
                    <div className="grid gap-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                Nama Item <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Contoh: Cappuccino, Nasi Goreng"
                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                                         focus:ring-4 focus:ring-primary/10 focus:border-primary 
                                         outline-none transition-all duration-200 
                                         placeholder:text-gray-400 font-medium"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Harga <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                        Rp
                                    </span>
                                    <input
                                        required
                                        type="number"
                                        placeholder="25000"
                                        className="w-full pl-12 pr-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                                                 focus:ring-4 focus:ring-primary/10 focus:border-primary 
                                                 outline-none transition-all duration-200 
                                                 placeholder:text-gray-400 font-medium"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Coffee, Food, Pastry, etc"
                                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                                             focus:ring-4 focus:ring-primary/10 focus:border-primary 
                                             outline-none transition-all duration-200 
                                             placeholder:text-gray-400 font-medium"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                Deskripsi
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Deskripsikan menu Anda..."
                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                                         focus:ring-4 focus:ring-primary/10 focus:border-primary 
                                         outline-none transition-all duration-200 
                                         placeholder:text-gray-400 font-medium resize-none"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                URL Gambar
                            </label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                                         focus:ring-4 focus:ring-primary/10 focus:border-primary 
                                         outline-none transition-all duration-200 
                                         placeholder:text-gray-400 font-medium"
                                value={newItem.image}
                                onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl">
                            💾 Simpan menu
                        </Button>
                    </div>
                </form>
            )}

            {/* Items List */}
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-5xl mb-3">🍽️</div>
                        <p className="text-gray-500 font-medium">Belum ada menu. Tambahkan sekarang!</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 font-medium mb-3">
                            Total: {items.length} item
                        </p>
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 
                                         rounded-xl transition-all duration-200 border-2 border-gray-100 hover:border-blue-200 
                                         hover:shadow-md group"
                            >
                                {/* Content Wrapper */}
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    {/* Image */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-primary/30 flex items-center justify-center">
                                        {(item.image && (item.image.startsWith('/') || item.image.startsWith('http'))) ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-gray-400 text-center px-1 font-medium leading-tight">
                                                Tidak ada gambar
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-semibold text-primary">Rp {item.price.toLocaleString('id-ID')}</span>
                                            {item.category && (
                                                <>
                                                    <span className="text-gray-300 hidden sm:inline">•</span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {item.category}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
                                    <button
                                        onClick={() => handleToggleStock(item)}
                                        className={`flex-1 sm:flex-none px-3 py-2 text-xs font-bold rounded-lg transition-all border-2 justify-center flex items-center
                                            ${item.isSoldOut
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                            }`}
                                    >
                                        {item.isSoldOut ? '🚫 Habis' : '✅ Tersedia'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="px-3 py-2 text-xs text-gray-500 font-semibold hover:bg-gray-100 
                                                 rounded-lg transition-all border-2 border-transparent 
                                                 hover:border-gray-200"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
