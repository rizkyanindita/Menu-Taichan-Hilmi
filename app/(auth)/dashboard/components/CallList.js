"use client";
import { useState } from "react";
import { Bell, BellOff, Clock, CheckCircle2 } from "lucide-react";

const MOCK_CALLS = [
    { id: 1, table: 5, time: "2 mins ago", note: "Need more napkins" },
    { id: 2, table: 9, time: "5 mins ago", note: "Request for the bill" },
];

export default function CallList() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
                        <Bell className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">Active Calls</h2>
                        <p className="text-xs text-gray-400">Customer requests</p>
                    </div>
                </div>
            </div>

            {/* ── Disabled Content ── */}
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <BellOff className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Fitur Belum Aktif</p>
                <p className="text-xs text-gray-400 max-w-[220px]">
                    🔒 Jika mau fitur ini bisa chat admin.
                </p>
            </div>
        </div>
    );
}
