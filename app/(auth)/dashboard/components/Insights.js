export default function Insights() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Daily Insights</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-blue-900">Rp 100.000.000</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-600 font-medium mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-purple-900">45</p>
                </div>
            </div>
            {/* Chart placeholder */}
            <div className="mt-6 h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-200">
                Chart Visualization
            </div>
        </div>
    )
}
