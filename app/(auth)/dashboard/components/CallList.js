"use client";
import Button from '@/components/Button';

export default function CallList() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Active Calls
            </h2>
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div>
                            <p className="font-bold text-gray-800">Table {i + 4}</p>
                            <p className="text-sm text-gray-500">2 mins ago</p>
                        </div>
                        <Button className="bg-white text-black border border-gray-200 hover:bg-gray-50 text-sm py-1.5">Dismiss</Button>
                    </div>
                ))}
                <div className="text-center text-gray-400 py-8 text-sm">No new calls</div>
            </div>
        </div>
    )
}
