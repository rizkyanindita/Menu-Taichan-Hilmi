export default function Skeleton() {
    return (
        <div className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-28 h-28 bg-gray-200 rounded-xl"></div>
        </div>
    )
}
