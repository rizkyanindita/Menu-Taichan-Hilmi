import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import MenuClientView from "./components/MenuClientView";

async function getMenu(cafeId) {
  try {
    const docRef = doc(db, "menus", cafeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        items: data.items || [],
        name: data.name || "Menu",
      };
    } else {
      // Return empty menu for new cafes instead of 404
      return {
        success: true,
        items: [],
        name: cafeId,
      };
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    return { success: false, error: "firebase_error", message: error.message };
  }
}

export default async function MenuPage({ params }) {
  const { cafeId } = await params;
  const result = await getMenu(cafeId);

  // If Firebase error, show helpful message
  if (!result.success) {
    if (result.error === "firebase_error") {
      return (
        <main className="p-4 max-w-2xl mx-auto min-h-screen flex items-center justify-center bg-gray-50/50">
          <div className="text-center bg-white shadow-2xl shadow-primary/5 rounded-[2rem] p-8 sm:p-10 max-w-sm border border-gray-100/60 w-full relative overflow-hidden">
            {/* Decorative Background Blur */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-100/50 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl"></div>

            <div className="relative">
              {/* Icon Container */}
              <div className="w-24 h-24 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-orange-50/50 shadow-inner">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Koneksi Timeout
              </h2>
              <p className="text-gray-500 mb-8 text-[15px] leading-relaxed font-medium">
                Ops! Server membutuhkan waktu terlalu lama untuk merespon.
                Silakan periksa koneksi internet Anda dan coba kembali.
              </p>

              <a
                href={`/menu/${cafeId}`}
                className="w-full py-4 bg-primary text-white text-base font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(234,88,12,0.6)] active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Muat Ulang Halaman
              </a>
            </div>
          </div>
        </main>
      );
    }
    notFound();
  }

  // Pass data to Client Component for Realtime Handling
  return (
    <MenuClientView
      initialItems={result.items}
      cafeId={cafeId}
      cafeName={result.name}
    />
  );
}
