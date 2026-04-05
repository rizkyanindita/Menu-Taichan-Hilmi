import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:gap-6 p-4 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent px-2 leading-tight">
                QR Menu App
            </h1>

            <div className="flex flex-wrap gap-4 justify-center">
                {/* <Link href="/dashboard?role=owner" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg">Owner Dashboard</Link> */}
                <Link href="/login" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Dashboard</Link>
                <Link href="/menu/demo-cafe" className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">View Menu</Link>
                {/* <Link href="/trial-menu" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm">View Trial Menu</Link> */}
            </div>

        </div>
    );
}
