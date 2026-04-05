"use client";
import { useState } from "react";
import { Bell, BellOff, Clock, CheckCircle2 } from "lucide-react";

const MOCK_CALLS = [
    { id: 1, table: 5, time: "2 mins ago", note: "Need more napkins" },
    { id: 2, table: 9, time: "5 mins ago", note: "Request for the bill" },
];

export default function CallList() {
    const [calls, setCalls] = useState(MOCK_CALLS);
    const [dismissed, setDismissed] = useState([]);

    const handleDismiss = (id) => {
        setDismissed((prev) => [...prev, id]);
        setTimeout(() => {
            setCalls((prev) => prev.filter((c) => c.id !== id));
            setDismissed((prev) => prev.filter((d) => d !== id));
        }, 400);
    };

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

                {/* Live badge */}
                {calls.length > 0 && (
                    <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        {calls.length} pending
                    </span>
                )}
            </div>

            {/* ── Call Cards ── */}
            <div className="flex flex-col gap-3">
                {calls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                            <BellOff className="h-6 w-6 text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">All clear!</p>
                        <p className="text-xs text-gray-400">No active calls right now</p>
                    </div>
                ) : (
                    calls.map((call) => (
                        <div
                            key={call.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 transition-all duration-300 ${
                                dismissed.includes(call.id) ? "opacity-0 scale-95" : "opacity-100 scale-100"
                            }`}
                        >
                            {/* Table number */}
                            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-md shadow-orange-200">
                                <span className="text-white font-black text-sm">{call.table}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">Table {call.table}</p>
                                <p className="text-xs text-gray-500 truncate">{call.note}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-400">{call.time}</span>
                                </div>
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={() => handleDismiss(call.id)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Done
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
