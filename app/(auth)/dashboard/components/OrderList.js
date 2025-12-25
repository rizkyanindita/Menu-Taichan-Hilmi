export default function OrderList() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-sm text-gray-400">
                            <th className="pb-3 font-medium">Order ID</th>
                            <th className="pb-3 font-medium">Table</th>
                            <th className="pb-3 font-medium">Total</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="border-b border-gray-50/50">
                            <td className="py-3 font-medium">#1023</td>
                            <td className="py-3">5</td>
                            <td className="py-3">$12.50</td>
                            <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold">Preparing</span></td>
                        </tr>
                        <tr>
                            <td className="py-3 font-medium">#1022</td>
                            <td className="py-3">2</td>
                            <td className="py-3">$24.00</td>
                            <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">Served</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
