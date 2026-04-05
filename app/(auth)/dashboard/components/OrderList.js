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
    const [filter, setFilter] = useState("All");
    const [expanded, setExpanded] = useState(null);

    const filters = ["All", "Preparing", "Served", "Cancelled"];
    const filtered = filter === "All" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

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
                        <p className="text-xs text-gray-400">{MOCK_ORDERS.length} orders today</p>
                    </div>
                </div>

                {/* Preparing count */}
                {MOCK_ORDERS.filter(o => o.status === "Preparing").length > 0 && (
                    <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {MOCK_ORDERS.filter(o => o.status === "Preparing").length} preparing
                    </span>
                )}
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            filter === f
                                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                : "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Order Cards ── */}
            <div className="flex flex-col gap-2.5">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 text-sm text-gray-400">No orders found</div>
                ) : (
                    filtered.map((order) => {
                        const cfg = STATUS_CONFIG[order.status];
                        const isExpanded = expanded === order.id;

                        return (
                            <div
                                key={order.id}
                                className="rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden transition-all"
                            >
                                {/* Main row */}
                                <button
                                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-100/70 transition-colors"
                                >
                                    {/* Table circle */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-black text-gray-700">{order.table}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{order.id}</span>
                                            <span className="text-xs text-gray-400">· Table {order.table}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{order.total}</p>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                        {order.status}
                                    </span>

                                    {/* Chevron */}
                                    <ChevronDown className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                {/* Expanded items */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-3 mb-2">Items</p>
                                        <div className="flex flex-wrap gap-2">
                                            {order.items.map((item, i) => (
                                                <span key={i} className="text-xs bg-white border border-gray-200 text-gray-700 font-medium px-3 py-1 rounded-lg">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
