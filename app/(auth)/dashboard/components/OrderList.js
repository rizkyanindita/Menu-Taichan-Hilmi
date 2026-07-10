"use client";
import { useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";

const STATUS_CONFIG = {
    Preparing: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        dot: "bg-amber-400",
    },
    Served: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        dot: "bg-green-400",
    },
    Cancelled: {
        bg: "bg-red-50",
        text: "text-red-500",
        border: "border-red-200",
        dot: "bg-red-400",
    },
};

const MOCK_ORDERS = [
    { id: "#1025", table: 3, total: "Rp 35.000", status: "Preparing", items: ["Taichan x2", "Es Teh"] },
    { id: "#1024", table: 7, total: "Rp 50.000", status: "Preparing", items: ["Taichan x3", "Air Mineral"] },
    { id: "#1023", table: 5, total: "Rp 27.000", status: "Served",    items: ["Taichan", "Lemon Tea"] },
    { id: "#1022", table: 2, total: "Rp 48.000", status: "Served",    items: ["Taichan x3", "Jus Jeruk"] },
    { id: "#1021", table: 8, total: "Rp 15.000", status: "Cancelled", items: ["Taichan"] },
];

export default function OrderList() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                        <ClipboardList className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">Recent Orders</h2>
                        <p className="text-xs text-gray-400">Order management</p>
                    </div>
                </div>
            </div>

            {/* ── Disabled Content ── */}
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <ClipboardList className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Fitur Belum Aktif</p>
                <p className="text-xs text-gray-400 max-w-[220px]">
                    🔒 Jika mau fitur ini bisa chat admin.
                </p>
            </div>
        </div>
    );
}
