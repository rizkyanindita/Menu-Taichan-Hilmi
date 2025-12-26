import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import MenuClientView from './components/MenuClientView';

async function getMenu(cafeId) {
    try {
        const docRef = doc(db, "menus", cafeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                success: true,
                items: data.items || [],
                name: data.name || "Menu"
            };
        } else {
            // Return empty menu for new cafes instead of 404
            return {
                success: true,
                items: [],
                name: cafeId
            };
        }
    } catch (error) {
        console.error("Error fetching menu:", error);
        return { success: false, error: 'firebase_error', message: error.message };
    }
}

export default async function MenuPage({ params }) {
    const { cafeId } = await params;
    const result = await getMenu(cafeId);

    // If Firebase error, show helpful message
    if (!result.success) {
        if (result.error === 'firebase_error') {
            return (
                <main className="p-4 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
                    <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
                        <div className="text-6xl mb-4">🔥</div>
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Firebase Connection Error</h2>
                        <p className="text-red-700 mb-4">Tidak dapat terhubung ke database.</p>
                        <div className="bg-white p-4 rounded-lg border border-red-100 mb-4">
                            <p className="text-sm text-gray-600 mb-2">Kemungkinan penyebab:</p>
                            <ul className="text-xs text-left text-gray-700 space-y-1">
                                <li>• Periksa file <code className="bg-gray-100 px-1 rounded">.env</code> Anda</li>
                                <li>• Pastikan Firebase credentials sudah benar</li>
                                <li>• Cek koneksi internet Anda</li>
                                <li>• Lihat console untuk detail error</li>
                            </ul>
                        </div>
                        <p className="text-xs text-gray-500">Error: {result.message}</p>
                    </div>
                </main>
            );
        }
        notFound();
    }

    // Pass data to Client Component for Realtime Handling
    return <MenuClientView initialItems={result.items} cafeId={cafeId} cafeName={result.name} />;
}
